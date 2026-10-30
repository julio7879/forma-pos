import { Prisma, PaymentMethod, PaymentType, PaymentStatus, OrderStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';

export interface CreatePaymentInput {
  orderId?: unknown;
  monto?: unknown;
  metodo?: unknown;
  tipo?: unknown;
  registrado_por_id?: unknown;
  nota?: unknown;
}

const VALID_METHODS: PaymentMethod[] = [
  PaymentMethod.EFECTIVO,
  PaymentMethod.TRANSFERENCIA,
  PaymentMethod.DEMO,
];

const VALID_TYPES: PaymentType[] = [
  PaymentType.ANTICIPO,
  PaymentType.SALDO,
  PaymentType.TOTAL,
];

/**
 * Registra un pago o anticipo para un pedido (RF-06, RF-07).
 * Recalcula atómicamente el total pagado, el saldo pendiente y el estado_pago.
 */
export async function createPayment(input: CreatePaymentInput) {
  // 1. Validar identificador del pedido
  if (typeof input.orderId !== 'string' || !input.orderId.trim()) {
    throw new AppError(
      'El campo "orderId" es obligatorio y debe ser una cadena válida (ID o Referencia).',
      400,
      'ORDER_ID_REQUIRED'
    );
  }

  const orderIdentifier = input.orderId.trim();

  // 2. Validar monto
  const rawMonto =
    typeof input.monto === 'number'
      ? input.monto
      : typeof input.monto === 'string' && input.monto.trim() !== ''
        ? Number(input.monto)
        : NaN;

  if (!Number.isFinite(rawMonto) || rawMonto <= 0) {
    throw new AppError(
      'El monto del pago debe ser un número mayor a 0.',
      400,
      'INVALID_PAYMENT_AMOUNT'
    );
  }

  const numMonto = Math.round(rawMonto);

  // 3. Validar método de pago
  const rawMetodo = typeof input.metodo === 'string' ? input.metodo.trim().toUpperCase() : '';
  if (!VALID_METHODS.includes(rawMetodo as PaymentMethod)) {
    throw new AppError(
      `Método de pago inválido: "${input.metodo}". Métodos permitidos: ${VALID_METHODS.join(', ')}.`,
      400,
      'INVALID_PAYMENT_METHOD'
    );
  }
  const metodo = rawMetodo as PaymentMethod;

  // 4. Buscar el pedido existente
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { referencia: orderIdentifier.toUpperCase() },
      ],
    },
    include: {
      payments: true,
    },
  });

  if (!order) {
    throw new AppError(
      `No se encontró el pedido con identificador "${orderIdentifier}".`,
      404,
      'ORDER_NOT_FOUND'
    );
  }

  // 5. Candados de Negocio
  if (order.estado_pedido === OrderStatus.CANCELADO) {
    throw new AppError(
      'No se pueden registrar pagos en un pedido que se encuentra cancelado.',
      400,
      'ORDER_CANCELLED'
    );
  }

  const totalFinal = Number(order.total_final);
  const totalPagadoActual = Number(order.total_pagado);
  const saldoPendiente = Math.max(0, totalFinal - totalPagadoActual);

  if (saldoPendiente <= 0 || order.estado_pago === PaymentStatus.PAGADO) {
    throw new AppError(
      'El pedido ya se encuentra completamente pagado (saldo pendiente: $0).',
      400,
      'ORDER_ALREADY_PAID'
    );
  }

  // 6. Manejo de excedentes / cambio en efectivo
  let montoAplicado = numMonto;
  let cambio = 0;

  if (metodo === PaymentMethod.EFECTIVO) {
    if (numMonto > saldoPendiente) {
      montoAplicado = saldoPendiente;
      cambio = numMonto - saldoPendiente;
    }
  } else {
    if (numMonto > saldoPendiente) {
      throw new AppError(
        `El monto a pagar ($${numMonto.toLocaleString('es-CO')}) excede el saldo pendiente ($${saldoPendiente.toLocaleString('es-CO')}).`,
        400,
        'AMOUNT_EXCEEDS_BALANCE'
      );
    }
  }

  // 7. Deducir o validar el tipo de pago (ANTICIPO, SALDO, TOTAL)
  let tipoPago: PaymentType;
  const rawTipo = typeof input.tipo === 'string' ? input.tipo.trim().toUpperCase() : '';

  if (VALID_TYPES.includes(rawTipo as PaymentType)) {
    tipoPago = rawTipo as PaymentType;
  } else {
    if (totalPagadoActual === 0 && montoAplicado >= totalFinal) {
      tipoPago = PaymentType.TOTAL;
    } else if (totalPagadoActual === 0) {
      tipoPago = PaymentType.ANTICIPO;
    } else {
      tipoPago = montoAplicado + totalPagadoActual >= totalFinal ? PaymentType.SALDO : PaymentType.ANTICIPO;
    }
  }

  // 8. Calcular nuevos valores del pedido
  const nuevoTotalPagado = totalPagadoActual + montoAplicado;
  const nuevoSaldoPendiente = Math.max(0, totalFinal - nuevoTotalPagado);

  let nuevoEstadoPago: PaymentStatus;
  if (nuevoTotalPagado >= totalFinal) {
    nuevoEstadoPago = PaymentStatus.PAGADO;
  } else if (nuevoTotalPagado > 0) {
    nuevoEstadoPago = PaymentStatus.ANTICIPO_PARCIAL;
  } else {
    nuevoEstadoPago = PaymentStatus.PENDIENTE;
  }

  const registradoPorId =
    typeof input.registrado_por_id === 'string' && input.registrado_por_id.trim()
      ? input.registrado_por_id.trim()
      : null;

  const nota = typeof input.nota === 'string' ? input.nota.trim() : null;

  // 9. Ejecución Transaccional Atómica ($transaction)
  const result = await prisma.$transaction(async (tx) => {
    // Validar existencia de usuario para evitar fallo de Foreign Key (P2003)
    let validUserId: string | null = null;
    if (registradoPorId) {
      const userFound = await tx.user.findUnique({ where: { id: registradoPorId } });
      if (userFound) validUserId = userFound.id;
    }

    // A. Crear registro de pago
    const payment = await tx.payment.create({
      data: {
        order_id: order.id,
        monto: new Prisma.Decimal(montoAplicado),
        tipo: tipoPago,
        metodo: metodo,
        registrado_por_id: validUserId,
      },
    });

    // B. Actualizar orden (total_pagado y estado_pago)
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        total_pagado: new Prisma.Decimal(nuevoTotalPagado),
        estado_pago: nuevoEstadoPago,
      },
    });

    // C. Bitácora de auditoría inmutable (RF-13)
    await tx.activityLog.create({
      data: {
        order_id: order.id,
        usuario_id: validUserId,
        accion: 'REGISTRO_PAGO',
        detalle_anterior: {
          total_pagado: totalPagadoActual,
          estado_pago: order.estado_pago,
          saldo_pendiente: saldoPendiente,
        },
        detalle_nuevo: {
          pago_id: payment.id,
          monto_recibido: numMonto,
          monto_aplicado: montoAplicado,
          cambio,
          metodo,
          tipo: tipoPago,
          total_pagado: nuevoTotalPagado,
          estado_pago: nuevoEstadoPago,
          saldo_pendiente: nuevoSaldoPendiente,
          nota,
        },
      },
    });

    return { payment, updatedOrder };
  });

  return {
    payment: {
      id: result.payment.id,
      order_id: result.payment.order_id,
      monto: Number(result.payment.monto),
      tipo: result.payment.tipo,
      metodo: result.payment.metodo,
      registrado_por_id: result.payment.registrado_por_id,
      fecha: result.payment.fecha,
    },
    order: {
      id: result.updatedOrder.id,
      referencia: result.updatedOrder.referencia,
      total_final: Number(result.updatedOrder.total_final),
      total_pagado: nuevoTotalPagado,
      saldo_pendiente: nuevoSaldoPendiente,
      estado_pago: nuevoEstadoPago,
      estado_pedido: result.updatedOrder.estado_pedido,
    },
    cambio,
  };
}

/**
 * Consulta el historial de pagos y balance de una orden por ID o Referencia.
 */
export async function getPaymentsByOrder(orderIdOrRef: string) {
  if (!orderIdOrRef || !orderIdOrRef.trim()) {
    throw new AppError(
      'Debes proporcionar un identificador de pedido válido.',
      400,
      'ORDER_ID_REQUIRED'
    );
  }

  const clean = orderIdOrRef.trim();
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: clean }, { referencia: clean.toUpperCase() }],
    },
    include: {
      payments: {
        orderBy: { fecha: 'desc' },
      },
    },
  });

  if (!order) {
    throw new AppError(
      `No se encontró el pedido "${orderIdOrRef}".`,
      404,
      'ORDER_NOT_FOUND'
    );
  }

  const totalFinal = Number(order.total_final);
  const totalPagado = Number(order.total_pagado);
  const saldoPendiente = Math.max(0, totalFinal - totalPagado);

  return {
    order_id: order.id,
    referencia: order.referencia,
    estado_pago: order.estado_pago,
    estado_pedido: order.estado_pedido,
    total_final: totalFinal,
    total_pagado: totalPagado,
    saldo_pendiente: saldoPendiente,
    payments: order.payments.map((p) => ({
      id: p.id,
      monto: Number(p.monto),
      tipo: p.tipo,
      metodo: p.metodo,
      registrado_por_id: p.registrado_por_id,
      fecha: p.fecha,
    })),
  };
}
