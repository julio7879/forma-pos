import {
  OrderOrigin,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  DiscountAppliedType,
  InventoryMovementType,
  PromotionType,
} from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import {
  calculateItemSubtotal,
  calculateOrderTotal,
  PriceCalculationItem,
} from '../../utils/priceCalculator';
import { generateOrderReference } from '../../utils/referenceGenerator';

export interface OrderOptionSelectionInput {
  option_id?: string;
  nombre?: string;
  opcion?: string;
  valor: string;
}

export interface CreateOrderItemInput {
  product_id: string;
  cantidad: number;
  opciones?: OrderOptionSelectionInput[];
  opciones_seleccionadas?: OrderOptionSelectionInput[];
}

export interface InitialPaymentInput {
  monto: number;
  tipo?: PaymentType;
  metodo: PaymentMethod;
  registrado_por_id?: string;
}

export interface CreateOrderInput {
  origen: OrderOrigin;
  cliente_nombre: string;
  cliente_contacto: string;
  fecha_deseada?: string;
  notas?: string;
  delivery_address?: string;
  codigo_promocion?: string;
  creado_por_id?: string;
  items: CreateOrderItemInput[];
  pago_inicial?: InitialPaymentInput;
}

interface StoredOptionCharge {
  valor: string;
  recargo: number;
}

interface SnapshotOption {
  option_id?: string;
  nombre: string;
  valor: string;
  recargo: number;
}

/**
 * Formatea un pedido de Prisma convirtiendo los campos Decimal a números enteros
 * y exponiendo tanto `id` como `order_id` según docs/api-contract.md.
 */
export function formatOrderResponse(order: any) {
  return {
    id: order.id,
    order_id: order.id,
    referencia: order.referencia,
    origen: order.origen,
    cliente_nombre: order.cliente_nombre,
    cliente_contacto: order.cliente_contacto,
    fecha_deseada: order.fecha_deseada,
    estado_pedido: order.estado_pedido,
    estado_pago: order.estado_pago,
    subtotal: Number(order.subtotal),
    total_extras: Number(order.total_extras),
    total_descuento: Number(order.total_descuento),
    total_final: Number(order.total_final),
    total_pagado: Number(order.total_pagado),
    notas: order.notas,
    creado_por_id: order.creado_por_id,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          cantidad: item.cantidad,
          nombre_snapshot: item.nombre_snapshot,
          precio_base_snapshot: Number(item.precio_base_snapshot),
          opciones_snapshot: item.opciones_snapshot,
          subtotal_item: Number(item.subtotal_item),
        }))
      : [],
    payments: Array.isArray(order.payments)
      ? order.payments.map((p: any) => ({
          id: p.id,
          monto: Number(p.monto),
          tipo: p.tipo,
          metodo: p.metodo,
          fecha: p.fecha,
        }))
      : undefined,
    discounts: Array.isArray(order.discounts)
      ? order.discounts.map((d: any) => ({
          id: d.id,
          codigo_snapshot: d.codigo_snapshot,
          tipo: d.tipo,
          valor_configurado: Number(d.valor_configurado),
          monto_descontado: Number(d.monto_descontado),
        }))
      : undefined,
  };
}

/**
 * Genera una referencia única verificando que no exista previamente en la BD.
 */
async function generateUniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateOrderReference('FORMA');
    const existing = await prisma.order.findUnique({
      where: { referencia: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  return `FORMA-${Date.now().toString().slice(-6)}`;
}

/**
 * Crea un nuevo pedido recalculando precios estrictamente en el servidor (RF-02)
 * y guardando snapshots inmutables (RF-13).
 */
export async function createOrder(input: CreateOrderInput) {
  if (!input.origen || !['WEB', 'POS'].includes(input.origen)) {
    throw new AppError(
      'El campo origen es obligatorio y debe ser WEB o POS.',
      400,
      'INVALID_ORIGIN'
    );
  }

  if (!input.cliente_nombre || !input.cliente_nombre.trim()) {
    throw new AppError(
      'El nombre del cliente (cliente_nombre) es obligatorio.',
      400,
      'MISSING_CLIENT_NAME'
    );
  }

  if (!input.cliente_contacto || !input.cliente_contacto.trim()) {
    throw new AppError(
      'El contacto del cliente (cliente_contacto) es obligatorio.',
      400,
      'MISSING_CLIENT_CONTACT'
    );
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new AppError(
      'El pedido debe incluir al menos un producto en items.',
      400,
      'EMPTY_ORDER_ITEMS'
    );
  }

  // 1. Obtener todos los productos solicitados con sus opciones desde Supabase
  const productIds = [...new Set(input.items.map((i) => i.product_id))];
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, activo: true },
    include: { options: true },
  });

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // 2. Validar cada ítem, existencias y calcular recargos reales desde la BD
  let baseSubtotalSum = 0;
  let extrasTotalSum = 0;
  const priceCalcItems: PriceCalculationItem[] = [];

  const preparedItems: Array<{
    product_id: string;
    cantidad: number;
    nombre_snapshot: string;
    precio_base_snapshot: number;
    opciones_snapshot: SnapshotOption[];
    subtotal_item: number;
  }> = [];

  for (const rawItem of input.items) {
    const product = productMap.get(rawItem.product_id);
    if (!product) {
      throw new AppError(
        'El producto solicitado no existe o está inactivo.',
        404,
        'PRODUCT_NOT_FOUND'
      );
    }

    const cantidad = Number(rawItem.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new AppError(
        `La cantidad para el producto "${product.nombre}" debe ser un entero mayor a 0.`,
        400,
        'INVALID_QUANTITY'
      );
    }

    if (product.stock_actual < cantidad) {
      throw new AppError(
        `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock_actual}, solicitado: ${cantidad}.`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    const rawSelections =
      rawItem.opciones ?? rawItem.opciones_seleccionadas ?? [];
    const snapshotOptions: SnapshotOption[] = [];
    let unitExtras = 0;

    // Validar opciones obligatorias y calcular recargos reales desde la base de datos
    for (const dbOption of product.options) {
      const matchedSelection = rawSelections.find(
        (sel) =>
          (sel.option_id && sel.option_id === dbOption.id) ||
          (sel.nombre &&
            sel.nombre.toLowerCase() === dbOption.nombre.toLowerCase()) ||
          (sel.opcion &&
            sel.opcion.toLowerCase() === dbOption.nombre.toLowerCase())
      );

      if (dbOption.obligatorio && (!matchedSelection || !matchedSelection.valor)) {
        throw new AppError(
          `La opción obligatoria "${dbOption.nombre}" es requerida para el producto "${product.nombre}".`,
          400,
          'MISSING_REQUIRED_OPTION'
        );
      }

      if (matchedSelection && matchedSelection.valor) {
        const catalogValues = Array.isArray(dbOption.valores_recargos)
          ? (dbOption.valores_recargos as unknown as StoredOptionCharge[])
          : [];

        const matchedValue = catalogValues.find(
          (v) =>
            v.valor.toLowerCase() === matchedSelection.valor.trim().toLowerCase()
        );

        let recargo = 0;
        if (matchedValue) {
          recargo = Number(matchedValue.recargo) || 0;
        } else if (dbOption.tipo === 'TEXT' && catalogValues.length > 0) {
          // Para campos de texto libre, aplica el recargo del primer descriptor configurado
          recargo = Number(catalogValues[0].recargo) || 0;
        } else if (catalogValues.length > 0) {
          throw new AppError(
            `El valor "${matchedSelection.valor}" no es válido para la opción "${dbOption.nombre}".`,
            400,
            'INVALID_OPTION_VALUE'
          );
        }

        unitExtras += recargo;
        snapshotOptions.push({
          option_id: dbOption.id,
          nombre: dbOption.nombre,
          valor: matchedSelection.valor,
          recargo,
        });
      }
    }

    const basePrice = Number(product.precio_base);
    const subtotalItem = calculateItemSubtotal({
      basePrice,
      extrasPrice: unitExtras,
      quantity: cantidad,
    });

    baseSubtotalSum += basePrice * cantidad;
    extrasTotalSum += unitExtras * cantidad;
    priceCalcItems.push({
      basePrice,
      extrasPrice: unitExtras,
      quantity: cantidad,
    });

    preparedItems.push({
      product_id: product.id,
      cantidad,
      nombre_snapshot: product.nombre,
      precio_base_snapshot: basePrice,
      opciones_snapshot: snapshotOptions,
      subtotal_item: subtotalItem,
    });
  }

  // 3. Evaluar promoción si se envió codigo_promocion (RF-11)
  let discountAmount = 0;
  let appliedPromotion: {
    id: string;
    codigo: string | null;
    tipo: PromotionType;
    valor: number;
  } | null = null;

  const grossTotal = baseSubtotalSum + extrasTotalSum;

  if (input.codigo_promocion && input.codigo_promocion.trim()) {
    const code = input.codigo_promocion.trim().toUpperCase();
    const promo = await prisma.promotion.findUnique({
      where: { codigo: code },
    });

    const now = new Date();
    if (
      !promo ||
      !promo.activo ||
      now < promo.fecha_inicio ||
      now > promo.fecha_fin
    ) {
      throw new AppError(
        `El código promocional "${code}" no existe o no se encuentra vigente.`,
        400,
        'PROMOTION_INVALID'
      );
    }

    const minPurchase = Number(promo.minimo_compra);
    if (grossTotal < minPurchase) {
      throw new AppError(
        `El cupón "${code}" requiere una compra mínima de ${minPurchase} COP.`,
        400,
        'PROMOTION_MIN_PURCHASE_NOT_MET'
      );
    }

    const promoValue = Number(promo.valor);
    if (promo.tipo === PromotionType.PORCENTAJE) {
      discountAmount = Math.round((grossTotal * promoValue) / 100);
    } else {
      discountAmount = Math.min(grossTotal, Math.round(promoValue));
    }

    appliedPromotion = {
      id: promo.id,
      codigo: promo.codigo,
      tipo: promo.tipo,
      valor: promoValue,
    };
  }

  // 4. Calcular total final con la utilidad central priceCalculator.ts (RF-02)
  const totals = calculateOrderTotal(priceCalcItems, discountAmount);
  const totalFinal = totals.total;

  // 5. Evaluar pago inicial si viene presente (RF-05, RF-07)
  let totalPagado = 0;
  let estadoPago: PaymentStatus = PaymentStatus.PENDIENTE;

  if (input.pago_inicial && Number(input.pago_inicial.monto) > 0) {
    const montoPago = Number(input.pago_inicial.monto);
    if (montoPago > totalFinal) {
      throw new AppError(
        `El monto pagado (${montoPago}) no puede superar el total final del pedido (${totalFinal}).`,
        400,
        'INVALID_PAYMENT_AMOUNT'
      );
    }
    totalPagado = montoPago;
    estadoPago =
      totalPagado >= totalFinal
        ? PaymentStatus.PAGADO
        : PaymentStatus.ANTICIPO_PARCIAL;
  }

  const referencia = await generateUniqueReference();
  const notasCompletas = [
    input.notas?.trim(),
    input.delivery_address ? `Dirección: ${input.delivery_address.trim()}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  // 6. Persistir todo en una transacción atómica de Prisma
  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        referencia,
        origen: input.origen,
        cliente_nombre: input.cliente_nombre.trim(),
        cliente_contacto: input.cliente_contacto.trim(),
        fecha_deseada: input.fecha_deseada ? new Date(input.fecha_deseada) : null,
        estado_pedido: OrderStatus.RECIBIDO,
        estado_pago: estadoPago,
        subtotal: baseSubtotalSum,
        total_extras: extrasTotalSum,
        total_descuento: discountAmount,
        total_final: totalFinal,
        total_pagado: totalPagado,
        notas: notasCompletas || null,
        creado_por_id: input.creado_por_id || null,
        items: {
          create: preparedItems.map((it) => ({
            product_id: it.product_id,
            cantidad: it.cantidad,
            nombre_snapshot: it.nombre_snapshot,
            precio_base_snapshot: it.precio_base_snapshot,
            opciones_snapshot: it.opciones_snapshot as any,
            subtotal_item: it.subtotal_item,
          })),
        },
        ...(appliedPromotion
          ? {
              discounts: {
                create: {
                  promotion_id: appliedPromotion.id,
                  codigo_snapshot: appliedPromotion.codigo,
                  tipo: DiscountAppliedType.PROMOCION,
                  valor_configurado: appliedPromotion.valor,
                  monto_descontado: discountAmount,
                },
              },
            }
          : {}),
        ...(input.pago_inicial && totalPagado > 0
          ? {
              payments: {
                create: {
                  monto: totalPagado,
                  tipo:
                    totalPagado >= totalFinal
                      ? PaymentType.TOTAL
                      : input.pago_inicial.tipo ?? PaymentType.ANTICIPO,
                  metodo: input.pago_inicial.metodo,
                  registrado_por_id:
                    input.pago_inicial.registrado_por_id ??
                    input.creado_por_id ??
                    null,
                },
              },
            }
          : {}),
      },
      include: {
        items: true,
        payments: true,
        discounts: true,
      },
    });

    // Descontar inventario y registrar movimiento por cada producto (RF-14)
    for (const item of preparedItems) {
      await tx.product.update({
        where: { id: item.product_id },
        data: { stock_actual: { decrement: item.cantidad } },
      });

      await tx.inventoryMovement.create({
        data: {
          product_id: item.product_id,
          tipo: InventoryMovementType.SALIDA_VENTA,
          cantidad: -item.cantidad,
          motivo: `Venta en pedido ${referencia} (${input.origen})`,
          usuario_id: input.creado_por_id || null,
        },
      });
    }

    // Registrar en bitácora de actividad (RF-19)
    await tx.activityLog.create({
      data: {
        order_id: order.id,
        usuario_id: input.creado_por_id || null,
        accion: 'CREACION_PEDIDO',
        detalle_nuevo: {
          referencia,
          origen: input.origen,
          estado_pedido: order.estado_pedido,
          estado_pago: order.estado_pago,
          total_final: totalFinal,
        },
      },
    });

    return order;
  });

  return formatOrderResponse(createdOrder);
}

/**
 * Lista los pedidos con filtros opcionales para el POS y panel administrativo.
 */
export async function listOrders(filters: {
  estado_pedido?: string;
  estado_pago?: string;
  origen?: string;
  limit?: number;
}) {
  const where: any = {};

  if (filters.estado_pedido) {
    where.estado_pedido = filters.estado_pedido.toUpperCase();
  }
  if (filters.estado_pago) {
    where.estado_pago = filters.estado_pago.toUpperCase();
  }
  if (filters.origen) {
    where.origen = filters.origen.toUpperCase();
  }

  const take = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 200) : 100;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      payments: true,
      discounts: true,
    },
    orderBy: { created_at: 'desc' },
    take,
  });

  return orders.map(formatOrderResponse);
}

/**
 * Obtiene un pedido por su ID (UUID) o por su referencia legible (ej. FORMA-1001).
 */
export async function getOrderByIdOrReference(idOrRef: string) {
  const normalized = idOrRef.trim();
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: normalized }, { referencia: normalized.toUpperCase() }],
    },
    include: {
      items: true,
      payments: true,
      discounts: true,
    },
  });

  if (!order) {
    throw new AppError(
      'El pedido solicitado no existe.',
      404,
      'ORDER_NOT_FOUND'
    );
  }

  return formatOrderResponse(order);
}

/**
 * Consulta pública de tracking por código de referencia (RF-08).
 * Si se envía `contacto`, verifica que coincida con el registrado en el pedido.
 */
export async function trackOrderByReference(
  referencia: string,
  contacto?: string
) {
  const refNormalized = referencia.trim().toUpperCase();
  const order = await prisma.order.findUnique({
    where: { referencia: refNormalized },
    include: {
      items: true,
      payments: true,
      discounts: true,
    },
  });

  if (!order) {
    throw new AppError(
      `No se encontró ningún pedido con la referencia ${refNormalized}.`,
      404,
      'ORDER_NOT_FOUND'
    );
  }

  if (
    contacto &&
    contacto.trim() &&
    order.cliente_contacto.trim().toLowerCase() !==
      contacto.trim().toLowerCase()
  ) {
    throw new AppError(
      'El dato de contacto no coincide con el registrado para este pedido.',
      403,
      'TRACKING_CONTACT_MISMATCH'
    );
  }

  return formatOrderResponse(order);
}

/**
 * Actualiza el estado operativo de un pedido (RF-06) registrando auditoría en ActivityLog.
 */
export async function updateOrderStatus(
  idOrRef: string,
  nuevoEstado: OrderStatus,
  usuarioId?: string
) {
  const validStatuses: OrderStatus[] = [
    OrderStatus.RECIBIDO,
    OrderStatus.EN_PREPARACION,
    OrderStatus.LISTO,
    OrderStatus.ENTREGADO,
    OrderStatus.CANCELADO,
  ];

  if (!validStatuses.includes(nuevoEstado)) {
    throw new AppError(
      `Estado de pedido inválido: ${nuevoEstado}. Valores permitidos: ${validStatuses.join(', ')}`,
      400,
      'INVALID_ORDER_STATUS'
    );
  }

  const existing = await prisma.order.findFirst({
    where: {
      OR: [{ id: idOrRef.trim() }, { referencia: idOrRef.trim().toUpperCase() }],
    },
  });

  if (!existing) {
    throw new AppError(
      'El pedido solicitado no existe.',
      404,
      'ORDER_NOT_FOUND'
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: existing.id },
      data: { estado_pedido: nuevoEstado },
      include: {
        items: true,
        payments: true,
        discounts: true,
      },
    });

    await tx.activityLog.create({
      data: {
        order_id: existing.id,
        usuario_id: usuarioId || null,
        accion: 'CAMBIO_ESTADO',
        detalle_anterior: { estado_pedido: existing.estado_pedido },
        detalle_nuevo: { estado_pedido: nuevoEstado },
      },
    });

    return order;
  });

  return formatOrderResponse(updated);
}
