import {
  PrismaClient,
  Prisma,
  Product,
  Role,
  OptionType,
  OrderOrigin,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  PromotionType,
  DiscountAppliedType,
  InventoryMovementType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { calculateOrderTotal } from '../src/utils/priceCalculator';

// Carga backend/.env sin depender de la carpeta desde donde se ejecute el comando.
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const prisma = new PrismaClient();

// Contraseña SOLO para la demo. Se puede cambiar con la variable SEED_PASSWORD.
const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? 'demo1234';

// ───────────────────────────── Tipos auxiliares ─────────────────────────────

type OptionValue = { valor: string; recargo: number };
type ChosenOption = { opcion: string; valor: string; recargo: number };

interface ItemInput {
  product: Product;
  cantidad: number;
  elegidas?: ChosenOption[];
}

interface PaymentInput {
  monto: number;
  tipo: PaymentType;
  metodo: PaymentMethod;
  registradoPorId: string;
}

interface DiscountInput {
  tipo: DiscountAppliedType;
  tipoValor: PromotionType; // solo para calcular el monto en el seed
  valor: number;
  promotionId?: string;
  codigo?: string;
  razonManual?: string;
  autorizadoPorId?: string;
}

interface OrderInput {
  referencia: string;
  origen: OrderOrigin;
  estadoPedido: OrderStatus;
  clienteNombre: string;
  clienteContacto: string;
  fechaDeseada?: Date;
  notas?: string;
  creadoPorId: string;
  items: ItemInput[];
  pagos?: PaymentInput[];
  descuento?: DiscountInput;
}

// ───────────────────────────── Utilidades ─────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** Borra todo en orden inverso a las llaves foráneas para que el seed sea repetible. */
async function clearDatabase() {
  await prisma.activityLog.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderDiscount.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

// ───────────────────────────── Usuarios (RF-12) ─────────────────────────────

async function seedUsers() {
  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const data: { nombre: string; email: string; rol: Role }[] = [
    { nombre: 'Admin FORMA', email: 'admin@forma.com', rol: Role.ADMIN },
    { nombre: 'Supervisor FORMA', email: 'supervisor@forma.com', rol: Role.SUPERVISOR },
    { nombre: 'Cajero FORMA', email: 'cajero@forma.com', rol: Role.VENDEDOR },
    { nombre: 'Taller FORMA', email: 'taller@forma.com', rol: Role.PREPARADOR },
  ];

  const users = await Promise.all(
    data.map((u) => prisma.user.create({ data: { ...u, password_hash } }))
  );

  return {
    admin: users[0],
    supervisor: users[1],
    vendedor: users[2],
    preparador: users[3],
  };
}

// ───────────────────────────── Productos y opciones (RF-01, RF-02, RF-10) ─────────────────────────────

function opcion(nombre: string, tipo: OptionType, obligatorio: boolean, valores: OptionValue[] = []) {
  return { nombre, tipo, obligatorio, valores_recargos: valores as Prisma.InputJsonValue };
}

async function seedProducts(adminId: string) {
  const products = {
    taza: await prisma.product.create({
      data: {
        nombre: 'Taza Cerámica Artesanal',
        descripcion: 'Taza de cerámica hecha a mano, con esmalte a elección.',
        categoria: 'Tazas',
        precio_base: 35000,
        stock_actual: 40,
        stock_minimo: 10,
        options: {
          create: [
            opcion('Color de esmalte', OptionType.COLOR, true, [
              { valor: 'Blanco', recargo: 0 },
              { valor: 'Azul', recargo: 0 },
              { valor: 'Verde', recargo: 0 },
              { valor: 'Terracota', recargo: 0 },
            ]),
            opcion('Grabado láser', OptionType.SELECT, false, [
              { valor: 'Sin grabado', recargo: 0 },
              { valor: 'Con grabado láser', recargo: 5000 },
            ]),
            opcion('Empaque', OptionType.SELECT, false, [
              { valor: 'Estándar', recargo: 0 },
              { valor: 'Empaque de regalo', recargo: 3000 },
            ]),
          ],
        },
      },
    }),
    camiseta: await prisma.product.create({
      data: {
        nombre: 'Camiseta Algodón Premium',
        descripcion: 'Camiseta de algodón premium con estampado personalizable.',
        categoria: 'Camisetas',
        precio_base: 55000,
        stock_actual: 30,
        stock_minimo: 8,
        options: {
          create: [
            opcion('Talla', OptionType.SELECT, true, [
              { valor: 'S', recargo: 0 },
              { valor: 'M', recargo: 0 },
              { valor: 'L', recargo: 0 },
              { valor: 'XL', recargo: 0 },
            ]),
            opcion('Color', OptionType.COLOR, true, [
              { valor: 'Blanco', recargo: 0 },
              { valor: 'Negro', recargo: 0 },
              { valor: 'Gris', recargo: 0 },
            ]),
            opcion('Estampado personalizado', OptionType.SELECT, false, [
              { valor: 'Sin estampado', recargo: 0 },
              { valor: 'Con estampado personalizado', recargo: 12000 },
            ]),
          ],
        },
      },
    }),
    libreta: await prisma.product.create({
      data: {
        nombre: 'Libreta de Cuero',
        descripcion: 'Libreta con tapa de cuero y hojas a elección.',
        categoria: 'Papelería',
        precio_base: 40000,
        stock_actual: 4, // por debajo del mínimo: sirve para probar la alerta de stock bajo
        stock_minimo: 5,
        options: {
          create: [
            opcion('Grabado de iniciales', OptionType.SELECT, false, [
              { valor: 'Sin grabado', recargo: 0 },
              { valor: 'Con iniciales grabadas', recargo: 8000 },
            ]),
            opcion('Tipo de hojas', OptionType.SELECT, true, [
              { valor: 'Rayadas', recargo: 0 },
              { valor: 'Puntos', recargo: 0 },
            ]),
          ],
        },
      },
    }),
    gorra: await prisma.product.create({
      data: {
        nombre: 'Gorra Bordada',
        descripcion: 'Gorra de tela con bordado de logo opcional.',
        categoria: 'Gorras',
        precio_base: 30000,
        stock_actual: 20,
        stock_minimo: 5,
        options: {
          create: [
            opcion('Color', OptionType.COLOR, true, [
              { valor: 'Negro', recargo: 0 },
              { valor: 'Azul', recargo: 0 },
              { valor: 'Beige', recargo: 0 },
            ]),
            opcion('Bordado de logo', OptionType.SELECT, false, [
              { valor: 'Sin bordado', recargo: 0 },
              { valor: 'Con bordado de logo', recargo: 10000 },
            ]),
          ],
        },
      },
    }),
  };

  // Movimiento inicial de inventario (ENTRADA) por cada producto.
  await prisma.inventoryMovement.createMany({
    data: Object.values(products).map((p) => ({
      product_id: p.id,
      tipo: InventoryMovementType.ENTRADA,
      cantidad: p.stock_actual,
      motivo: 'Stock inicial (seed)',
      usuario_id: adminId,
    })),
  });

  return products;
}

// ───────────────────────────── Promociones (RF-11) ─────────────────────────────

async function seedPromotions() {
  const bienvenida = await prisma.promotion.create({
    data: {
      nombre: 'Bienvenida 10%',
      codigo: 'BIENVENIDA10',
      tipo: PromotionType.PORCENTAJE,
      valor: 10,
      alcance: 'PEDIDO',
      minimo_compra: 50000,
      fecha_inicio: daysFromNow(-30),
      fecha_fin: daysFromNow(180),
      activo: true,
    },
  });

  const promo5k = await prisma.promotion.create({
    data: {
      nombre: 'Descuento fijo $5.000',
      codigo: 'PROMO5K',
      tipo: PromotionType.FIJO,
      valor: 5000,
      alcance: 'PEDIDO',
      minimo_compra: 0,
      fecha_inicio: daysFromNow(-30),
      fecha_fin: daysFromNow(180),
      activo: true,
    },
  });

  return { bienvenida, promo5k };
}

// ───────────────────────────── Pedidos (RF-03..08, RF-13) ─────────────────────────────

async function createOrder(input: OrderInput) {
  const lineas = input.items.map(({ product, cantidad, elegidas = [] }) => {
    const base = Number(product.precio_base);
    const extras = elegidas.reduce((sum, c) => sum + c.recargo, 0);
    return { product, cantidad, elegidas, base, extras };
  });

  const subtotal = lineas.reduce((sum, l) => sum + l.base * l.cantidad, 0);
  const totalExtras = lineas.reduce((sum, l) => sum + l.extras * l.cantidad, 0);
  const bruto = subtotal + totalExtras;

  // Monto del descuento (misma regla que usará el backend).
  let montoDescontado = 0;
  if (input.descuento) {
    montoDescontado =
      input.descuento.tipoValor === PromotionType.PORCENTAJE
        ? Math.round((bruto * input.descuento.valor) / 100)
        : input.descuento.valor;
  }

  // Total final con la fuente única de verdad (RF-02).
  const { total: totalFinal } = calculateOrderTotal(
    lineas.map((l) => ({ basePrice: l.base, extrasPrice: l.extras, quantity: l.cantidad })),
    montoDescontado
  );

  const pagos = input.pagos ?? [];
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const estadoPago: PaymentStatus =
    totalPagado <= 0
      ? PaymentStatus.PENDIENTE
      : totalPagado >= totalFinal
        ? PaymentStatus.PAGADO
        : PaymentStatus.ANTICIPO_PARCIAL;

  const order = await prisma.order.create({
    data: {
      referencia: input.referencia,
      origen: input.origen,
      cliente_nombre: input.clienteNombre,
      cliente_contacto: input.clienteContacto,
      fecha_deseada: input.fechaDeseada,
      estado_pedido: input.estadoPedido,
      estado_pago: estadoPago,
      subtotal,
      total_extras: totalExtras,
      total_descuento: montoDescontado,
      total_final: totalFinal,
      total_pagado: totalPagado,
      notas: input.notas,
      creado_por_id: input.creadoPorId,
      // Snapshots inmutables (RF-13)
      items: {
        create: lineas.map((l) => ({
          product_id: l.product.id,
          nombre_snapshot: l.product.nombre,
          cantidad: l.cantidad,
          precio_base_snapshot: l.base,
          opciones_snapshot: l.elegidas as unknown as Prisma.InputJsonValue,
          subtotal_item: (l.base + l.extras) * l.cantidad,
        })),
      },
      payments: {
        create: pagos.map((p) => ({
          monto: p.monto,
          tipo: p.tipo,
          metodo: p.metodo,
          registrado_por_id: p.registradoPorId,
        })),
      },
      discounts: input.descuento
        ? {
            create: {
              tipo: input.descuento.tipo,
              promotion_id: input.descuento.promotionId,
              codigo_snapshot: input.descuento.codigo,
              valor_configurado: input.descuento.valor,
              monto_descontado: montoDescontado,
              razon_manual: input.descuento.razonManual,
              autorizado_por_id: input.descuento.autorizadoPorId,
            },
          }
        : undefined,
    },
  });

  // Inventario: salida por venta (y baja del stock actual) salvo pedidos cancelados.
  if (input.estadoPedido !== OrderStatus.CANCELADO) {
    for (const l of lineas) {
      await prisma.inventoryMovement.create({
        data: {
          product_id: l.product.id,
          tipo: InventoryMovementType.SALIDA_VENTA,
          cantidad: -l.cantidad,
          motivo: `Venta ${input.referencia}`,
          usuario_id: input.creadoPorId,
        },
      });
      await prisma.product.update({
        where: { id: l.product.id },
        data: { stock_actual: { decrement: l.cantidad } },
      });
    }
  }

  // Registro de actividad (feed del dashboard / auditoría).
  await prisma.activityLog.create({
    data: {
      order_id: order.id,
      usuario_id: input.creadoPorId,
      accion: 'CREACION_PEDIDO',
      detalle_nuevo: { referencia: input.referencia, origen: input.origen, total_final: totalFinal },
    },
  });

  if (input.estadoPedido !== OrderStatus.RECIBIDO) {
    await prisma.activityLog.create({
      data: {
        order_id: order.id,
        usuario_id: input.creadoPorId,
        accion: 'CAMBIO_ESTADO',
        detalle_anterior: { estado_pedido: OrderStatus.RECIBIDO },
        detalle_nuevo: { estado_pedido: input.estadoPedido },
      },
    });
  }

  for (const p of pagos) {
    await prisma.activityLog.create({
      data: {
        order_id: order.id,
        usuario_id: p.registradoPorId,
        accion: 'PAGO_REGISTRADO',
        detalle_nuevo: { monto: p.monto, tipo: p.tipo, metodo: p.metodo },
      },
    });
  }

  if (input.descuento) {
    await prisma.activityLog.create({
      data: {
        order_id: order.id,
        usuario_id: input.descuento.autorizadoPorId ?? input.creadoPorId,
        accion:
          input.descuento.tipo === DiscountAppliedType.MANUAL
            ? 'DESCUENTO_MANUAL'
            : 'DESCUENTO_PROMOCION',
        detalle_nuevo: { monto_descontado: montoDescontado, codigo: input.descuento.codigo ?? null },
      },
    });
  }

  return order;
}

async function seedOrders(
  users: Awaited<ReturnType<typeof seedUsers>>,
  products: Awaited<ReturnType<typeof seedProducts>>,
  promos: Awaited<ReturnType<typeof seedPromotions>>
) {
  // 1) WEB recién recibido, sin pago. Taza x2 con grabado y empaque de regalo.
  await createOrder({
    referencia: 'FORMA-1001',
    origen: OrderOrigin.WEB,
    estadoPedido: OrderStatus.RECIBIDO,
    clienteNombre: 'Laura Gómez',
    clienteContacto: 'laura@example.com',
    fechaDeseada: daysFromNow(7),
    notas: 'Regalo de cumpleaños.',
    creadoPorId: users.vendedor.id,
    items: [
      {
        product: products.taza,
        cantidad: 2,
        elegidas: [
          { opcion: 'Color de esmalte', valor: 'Azul', recargo: 0 },
          { opcion: 'Grabado láser', valor: 'Con grabado láser', recargo: 5000 },
          { opcion: 'Empaque', valor: 'Empaque de regalo', recargo: 3000 },
        ],
      },
    ],
  });

  // 2) POS en preparación: camisetas con estampado, promo BIENVENIDA10 y anticipo.
  await createOrder({
    referencia: 'FORMA-1002',
    origen: OrderOrigin.POS,
    estadoPedido: OrderStatus.EN_PREPARACION,
    clienteNombre: 'Carlos Pérez',
    clienteContacto: '3001234567',
    fechaDeseada: daysFromNow(4),
    creadoPorId: users.vendedor.id,
    items: [
      {
        product: products.camiseta,
        cantidad: 3,
        elegidas: [
          { opcion: 'Talla', valor: 'M', recargo: 0 },
          { opcion: 'Color', valor: 'Negro', recargo: 0 },
          { opcion: 'Estampado personalizado', valor: 'Con estampado personalizado', recargo: 12000 },
        ],
      },
    ],
    pagos: [
      {
        monto: 80000,
        tipo: PaymentType.ANTICIPO,
        metodo: PaymentMethod.EFECTIVO,
        registradoPorId: users.vendedor.id,
      },
    ],
    descuento: {
      tipo: DiscountAppliedType.PROMOCION,
      tipoValor: PromotionType.PORCENTAJE,
      valor: 10,
      promotionId: promos.bienvenida.id,
      codigo: 'BIENVENIDA10',
    },
  });

  // 3) POS listo para entrega: libreta con iniciales, promo PROMO5K y pago total.
  await createOrder({
    referencia: 'FORMA-1003',
    origen: OrderOrigin.POS,
    estadoPedido: OrderStatus.LISTO,
    clienteNombre: 'María Rojas',
    clienteContacto: 'maria@example.com',
    creadoPorId: users.vendedor.id,
    items: [
      {
        product: products.libreta,
        cantidad: 1,
        elegidas: [
          { opcion: 'Grabado de iniciales', valor: 'Con iniciales grabadas', recargo: 8000 },
          { opcion: 'Tipo de hojas', valor: 'Puntos', recargo: 0 },
        ],
      },
    ],
    descuento: {
      tipo: DiscountAppliedType.PROMOCION,
      tipoValor: PromotionType.FIJO,
      valor: 5000,
      promotionId: promos.promo5k.id,
      codigo: 'PROMO5K',
    },
    pagos: [
      {
        monto: 43000,
        tipo: PaymentType.TOTAL,
        metodo: PaymentMethod.TRANSFERENCIA,
        registradoPorId: users.vendedor.id,
      },
    ],
  });

  // 4) WEB entregado y pagado: gorras con bordado de logo.
  await createOrder({
    referencia: 'FORMA-1004',
    origen: OrderOrigin.WEB,
    estadoPedido: OrderStatus.ENTREGADO,
    clienteNombre: 'Andrés Torres',
    clienteContacto: '3109876543',
    creadoPorId: users.vendedor.id,
    items: [
      {
        product: products.gorra,
        cantidad: 2,
        elegidas: [
          { opcion: 'Color', valor: 'Negro', recargo: 0 },
          { opcion: 'Bordado de logo', valor: 'Con bordado de logo', recargo: 10000 },
        ],
      },
    ],
    pagos: [
      {
        monto: 80000,
        tipo: PaymentType.TOTAL,
        metodo: PaymentMethod.DEMO,
        registradoPorId: users.vendedor.id,
      },
    ],
  });

  // 5) Cancelado (no mueve inventario).
  await createOrder({
    referencia: 'FORMA-1005',
    origen: OrderOrigin.WEB,
    estadoPedido: OrderStatus.CANCELADO,
    clienteNombre: 'Sofía Díaz',
    clienteContacto: 'sofia@example.com',
    creadoPorId: users.vendedor.id,
    items: [
      {
        product: products.taza,
        cantidad: 1,
        elegidas: [{ opcion: 'Color de esmalte', valor: 'Blanco', recargo: 0 }],
      },
    ],
  });
}

// ───────────────────────────── Main ─────────────────────────────

async function main() {
  console.log('Iniciando carga de datos semilla para la demo de FORMA POS...');
  console.log('Aviso: este seed BORRA los datos existentes antes de cargar los de demo.');

  await clearDatabase();
  const users = await seedUsers();
  const products = await seedProducts(users.admin.id);
  const promos = await seedPromotions();
  await seedOrders(users, products, promos);

  const [u, p, o, pr, or, oi, pa] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.productOption.count(),
    prisma.promotion.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.payment.count(),
  ]);

  console.log('Seed completado.');
  console.log(
    `Usuarios: ${u} | Productos: ${p} | Opciones: ${o} | Promociones: ${pr} | Pedidos: ${or} | Ítems: ${oi} | Pagos: ${pa}`
  );
  console.log(`Usuarios demo (contraseña: ${DEMO_PASSWORD}):`);
  console.log('  admin@forma.com | supervisor@forma.com | cajero@forma.com | taller@forma.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
