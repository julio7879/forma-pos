import {
  PrismaClient,
  Prisma,
  Product,
  Promotion,
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

// Cantidades del seed (mínimo 50 registros por entidad).
const EXTRA_USERS = 46; // 4 base + 46 = 50 usuarios
const EXTRA_PRODUCTS = 46; // 4 base + 46 = 50 productos
const EXTRA_PROMOTIONS = 48; // 2 base + 48 = 50 promociones
const EXTRA_ORDERS = 65; // 5 base + 65 = 70 pedidos

// ───────────────────────────── Tipos auxiliares ─────────────────────────────

type OptionValue = { valor: string; recargo: number };
type ChosenOption = { opcion: string; valor: string; recargo: number };

interface ItemInput {
  product: Product;
  cantidad: number;
  elegidas?: ChosenOption[];
}

interface PaymentInput {
  monto?: number; // monto exacto
  fraccion?: number; // fracción del total final (ej. 0.5 para un anticipo del 50%)
  resto?: boolean; // paga lo que falta hasta completar el total final
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
  fecha?: Date; // fecha de creación (permite repartir los pedidos en el tiempo)
  notas?: string;
  creadoPorId: string;
  items: ItemInput[];
  pagos?: PaymentInput[];
  descuento?: DiscountInput;
}

// ───────────────────────────── Utilidades ─────────────────────────────

const NOMBRES = ['Camila', 'Juan', 'Valentina', 'Sebastián', 'Daniela', 'Andrés', 'Laura', 'Mateo', 'Sofía', 'Santiago', 'Paula', 'Felipe'];
const APELLIDOS = ['Gómez', 'Rodríguez', 'Martínez', 'López', 'García', 'Hernández', 'Torres', 'Ramírez', 'Díaz', 'Vargas', 'Castro', 'Moreno'];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

function brutoDe(items: ItemInput[]): number {
  return items.reduce((sum, { product, cantidad, elegidas = [] }) => {
    const extras = elegidas.reduce((s, c) => s + c.recargo, 0);
    return sum + (Number(product.precio_base) + extras) * cantidad;
  }, 0);
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

  const base: { nombre: string; email: string; rol: Role; activo: boolean }[] = [
    { nombre: 'Julio Administrador', email: 'admin@forma.com', rol: Role.ADMIN, activo: true },
    { nombre: 'Carlos Supervisor', email: 'supervisor@forma.com', rol: Role.SUPERVISOR, activo: true },
    { nombre: 'Ana Cajera', email: 'cajero@forma.com', rol: Role.VENDEDOR, activo: true },
    { nombre: 'Mateo Taller', email: 'taller@forma.com', rol: Role.PREPARADOR, activo: true },
  ];

  const extra = Array.from({ length: EXTRA_USERS }, (_, k) => {
    const rol = k % 4 === 0 ? Role.SUPERVISOR : k % 4 === 3 ? Role.PREPARADOR : Role.VENDEDOR;
    return {
      nombre: `${NOMBRES[k % NOMBRES.length]} ${APELLIDOS[(k * 7 + 3) % APELLIDOS.length]}`,
      email: `usuario${pad(k + 1)}@forma.com`,
      rol,
      activo: k % 15 !== 14, // algunos usuarios desactivados para probar el flujo
    };
  });

  const users = await prisma.user.createManyAndReturn({
    data: [...base, ...extra].map((u) => ({ ...u, password_hash })),
  });

  const byEmail = (email: string) => users.find((u) => u.email === email)!;

  return {
    admin: byEmail('admin@forma.com'),
    supervisor: byEmail('supervisor@forma.com'),
    vendedor: byEmail('cajero@forma.com'),
    preparador: byEmail('taller@forma.com'),
    // Solo usuarios activos con rol VENDEDOR pueden "crear" pedidos en el seed.
    vendedores: users.filter((u) => u.rol === Role.VENDEDOR && u.activo),
  };
}

// ───────────────────────────── Productos y opciones (RF-01, RF-02, RF-10) ─────────────────────────────

function opcion(nombre: string, tipo: OptionType, obligatorio: boolean, valores: OptionValue[] = []) {
  return { nombre, tipo, obligatorio, valores_recargos: valores as Prisma.InputJsonValue };
}

const COLORES = ['Blanco', 'Negro', 'Azul'];
const TIPOS_PRODUCTO = ['Taza', 'Camiseta', 'Libreta', 'Gorra', 'Termo', 'Mousepad', 'Llavero', 'Cojín', 'Botella', 'Tote Bag', 'Sudadera', 'Agenda', 'Portavasos', 'Cuadro', 'Plato'];
const VARIANTES = ['Clásica', 'Premium', 'Artesanal', 'Edición Taller'];
const CATEGORIAS = ['Cerámica', 'Textil', 'Papelería', 'Accesorios', 'Hogar', 'Regalos'];

type GeneratedProduct = { product: Product; recargoPersonalizacion: number };

async function seedProducts(adminId: string) {
  // 4 productos base (los de la tarea), con todas sus opciones.
  const base = {
    taza: await prisma.product.create({
      data: {
        nombre: 'Taza Cerámica Artesanal',
        descripcion: 'Taza de cerámica hecha a mano, con esmalte a elección.',
        categoria: 'Cerámica',
        precio_base: 25000,
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
              { valor: 'Grabado Láser', recargo: 5000 },
            ]),
            opcion('Empaque especial', OptionType.SELECT, false, [
              { valor: 'Estándar', recargo: 0 },
              { valor: 'Empaque especial', recargo: 3000 },
            ]),
          ],
        },
      },
    }),
    camiseta: await prisma.product.create({
      data: {
        nombre: 'Camiseta Algodón Premium',
        descripcion: 'Camiseta de algodón premium con estampado personalizable.',
        categoria: 'Textil',
        precio_base: 45000,
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
            opcion('Estampado personalizado frontal', OptionType.SELECT, false, [
              { valor: 'Sin estampado', recargo: 0 },
              { valor: 'Estampado personalizado frontal', recargo: 12000 },
            ]),
          ],
        },
      },
    }),
    libreta: await prisma.product.create({
      data: {
        nombre: 'Libreta de Cuero Personalizada',
        descripcion: 'Libreta con tapa de cuero y hojas a elección.',
        categoria: 'Papelería',
        precio_base: 38000,
        stock_actual: 4, // por debajo del mínimo: sirve para probar la alerta de stock bajo
        stock_minimo: 5,
        options: {
          create: [
            opcion('Grabado de iniciales', OptionType.SELECT, false, [
              { valor: 'Sin grabado', recargo: 0 },
              { valor: 'Grabado de iniciales', recargo: 8000 },
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
        nombre: 'Gorra Bordada Taller',
        descripcion: 'Gorra de tela con bordado de logo opcional.',
        categoria: 'Accesorios',
        precio_base: 32000,
        stock_actual: 20,
        stock_minimo: 5,
        options: {
          create: [
            opcion('Color', OptionType.COLOR, true, [
              { valor: 'Negro', recargo: 0 },
              { valor: 'Azul', recargo: 0 },
              { valor: 'Beige', recargo: 0 },
            ]),
            opcion('Bordado logo personalizado', OptionType.SELECT, false, [
              { valor: 'Sin bordado', recargo: 0 },
              { valor: 'Bordado logo personalizado', recargo: 10000 },
            ]),
          ],
        },
      },
    }),
  };

  // Productos adicionales generados (catálogo más amplio para probar listados y filtros).
  const specs = Array.from({ length: EXTRA_PRODUCTS }, (_, k) => ({
    k,
    nombre: `${TIPOS_PRODUCTO[k % TIPOS_PRODUCTO.length]} ${VARIANTES[Math.floor(k / TIPOS_PRODUCTO.length)]}`,
    categoria: CATEGORIAS[k % CATEGORIAS.length],
    precio_base: 15000 + (k % 12) * 4500,
    stock_actual: 60 + (k % 5) * 10,
    stock_minimo: 5 + (k % 4),
    recargoPersonalizacion: 4000 + (k % 5) * 1000,
  }));

  const creados = await prisma.product.createManyAndReturn({
    data: specs.map((s) => ({
      nombre: s.nombre,
      descripcion: `Producto personalizable de la línea ${s.categoria}.`,
      categoria: s.categoria,
      precio_base: s.precio_base,
      stock_actual: s.stock_actual,
      stock_minimo: s.stock_minimo,
    })),
  });

  const generated: GeneratedProduct[] = specs.map((s) => ({
    product: creados.find((p) => p.nombre === s.nombre)!,
    recargoPersonalizacion: s.recargoPersonalizacion,
  }));

  // Dos opciones por producto generado: Color y Personalización.
  await prisma.productOption.createMany({
    data: generated.flatMap(({ product, recargoPersonalizacion }) => [
      {
        product_id: product.id,
        ...opcion('Color', OptionType.COLOR, true, COLORES.map((valor) => ({ valor, recargo: 0 }))),
      },
      {
        product_id: product.id,
        ...opcion('Personalización', OptionType.SELECT, false, [
          { valor: 'Sin personalización', recargo: 0 },
          { valor: 'Con personalización', recargo: recargoPersonalizacion },
        ]),
      },
    ]),
  });

  // Movimiento inicial de inventario (ENTRADA) por cada producto.
  const todos = [...Object.values(base), ...generated.map((g) => g.product)];
  await prisma.inventoryMovement.createMany({
    data: todos.map((p) => ({
      product_id: p.id,
      tipo: InventoryMovementType.ENTRADA,
      cantidad: p.stock_actual,
      motivo: 'Stock inicial (seed)',
      usuario_id: adminId,
      fecha: daysFromNow(-30),
    })),
  });

  return { base, generated };
}

// ───────────────────────────── Promociones (RF-11) ─────────────────────────────

async function seedPromotions() {
  const ahora = new Date();

  const base = [
    {
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
    {
      nombre: 'Descuento fijo $5.000',
      codigo: 'PROMO5K',
      tipo: PromotionType.FIJO,
      valor: 5000,
      alcance: 'PEDIDO',
      minimo_compra: 30000,
      fecha_inicio: daysFromNow(-30),
      fecha_fin: daysFromNow(180),
      activo: true,
    },
  ];

  // Promociones adicionales: vigentes, vencidas (inactivas) y futuras.
  const extra = Array.from({ length: EXTRA_PROMOTIONS }, (_, k) => {
    const esPorcentaje = k % 2 === 0;
    const valor = esPorcentaje ? 5 + (k % 5) * 5 : 2000 + (k % 5) * 1500;
    const vencida = k % 8 === 7;
    const futura = !vencida && k % 11 === 10;
    return {
      nombre: esPorcentaje ? `Descuento ${valor}%` : `Descuento fijo $${valor}`,
      codigo: `PROMO${pad(k + 10)}`,
      tipo: esPorcentaje ? PromotionType.PORCENTAJE : PromotionType.FIJO,
      valor,
      alcance: 'PEDIDO',
      minimo_compra: [0, 20000, 30000][k % 3],
      fecha_inicio: vencida ? daysFromNow(-90) : futura ? daysFromNow(30) : daysFromNow(-30),
      fecha_fin: vencida ? daysFromNow(-30) : futura ? daysFromNow(90) : daysFromNow(180),
      activo: !vencida,
    };
  });

  const promos = await prisma.promotion.createManyAndReturn({ data: [...base, ...extra] });

  const byCodigo = (codigo: string) => promos.find((p) => p.codigo === codigo)!;
  const vigentes = promos.filter(
    (p) => p.activo && p.fecha_inicio <= ahora && p.fecha_fin >= ahora
  );

  return {
    bienvenida: byCodigo('BIENVENIDA10'),
    promo5k: byCodigo('PROMO5K'),
    vigentes, // promociones que se pueden aplicar hoy
  };
}

// ───────────────────────────── Pedidos (RF-03..08, RF-13) ─────────────────────────────

async function createOrder(input: OrderInput) {
  const fecha = input.fecha ?? new Date();

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

  // Resuelve los montos de los pagos.
  let acumulado = 0;
  const pagos = (input.pagos ?? []).map((p) => {
    let monto: number;
    if (p.monto !== undefined) monto = p.monto;
    else if (p.resto) monto = totalFinal - acumulado;
    else monto = Math.round((totalFinal * (p.fraccion ?? 1)) / 100) * 100;
    acumulado += monto;
    return { ...p, monto };
  });

  const totalPagado = acumulado;
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
      created_at: fecha,
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
          fecha,
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
              created_at: fecha,
            },
          }
        : undefined,
    },
  });

  // Inventario: salida por venta (y baja del stock actual) salvo pedidos cancelados.
  if (input.estadoPedido !== OrderStatus.CANCELADO) {
    await prisma.inventoryMovement.createMany({
      data: lineas.map((l) => ({
        product_id: l.product.id,
        tipo: InventoryMovementType.SALIDA_VENTA,
        cantidad: -l.cantidad,
        motivo: `Venta ${input.referencia}`,
        usuario_id: input.creadoPorId,
        fecha,
      })),
    });

    const porProducto = new Map<string, number>();
    for (const l of lineas) {
      porProducto.set(l.product.id, (porProducto.get(l.product.id) ?? 0) + l.cantidad);
    }
    await Promise.all(
      [...porProducto.entries()].map(([id, cantidad]) =>
        prisma.product.update({ where: { id }, data: { stock_actual: { decrement: cantidad } } })
      )
    );
  }

  // Registro de actividad (feed del dashboard / auditoría).
  const logs: Prisma.ActivityLogCreateManyInput[] = [
    {
      order_id: order.id,
      usuario_id: input.creadoPorId,
      accion: 'CREACION_PEDIDO',
      detalle_nuevo: { referencia: input.referencia, origen: input.origen, total_final: totalFinal },
      fecha,
    },
  ];

  if (input.estadoPedido !== OrderStatus.RECIBIDO) {
    logs.push({
      order_id: order.id,
      usuario_id: input.creadoPorId,
      accion: 'CAMBIO_ESTADO',
      detalle_anterior: { estado_pedido: OrderStatus.RECIBIDO },
      detalle_nuevo: { estado_pedido: input.estadoPedido },
      fecha,
    });
  }

  for (const p of pagos) {
    logs.push({
      order_id: order.id,
      usuario_id: p.registradoPorId,
      accion: 'PAGO_REGISTRADO',
      detalle_nuevo: { monto: p.monto, tipo: p.tipo, metodo: p.metodo },
      fecha,
    });
  }

  if (input.descuento) {
    logs.push({
      order_id: order.id,
      usuario_id: input.descuento.autorizadoPorId ?? input.creadoPorId,
      accion:
        input.descuento.tipo === DiscountAppliedType.MANUAL ? 'DESCUENTO_MANUAL' : 'DESCUENTO_PROMOCION',
      detalle_nuevo: { monto_descontado: montoDescontado, codigo: input.descuento.codigo ?? null },
      fecha,
    });
  }

  await prisma.activityLog.createMany({ data: logs });

  return order;
}

/** 5 pedidos base de la tarea (casos controlados para validar trazabilidad). */
async function seedBaseOrders(
  users: Awaited<ReturnType<typeof seedUsers>>,
  products: Awaited<ReturnType<typeof seedProducts>>['base'],
  promos: Awaited<ReturnType<typeof seedPromotions>>
) {
  // 1) WEB recién recibido, sin pago. Taza x2 con grabado y empaque especial.
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
          { opcion: 'Grabado láser', valor: 'Grabado Láser', recargo: 5000 },
          { opcion: 'Empaque especial', valor: 'Empaque especial', recargo: 3000 },
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
          { opcion: 'Estampado personalizado frontal', valor: 'Estampado personalizado frontal', recargo: 12000 },
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

  // 3) POS listo para entrega: libreta con iniciales, promo PROMO5K y pago total en efectivo.
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
          { opcion: 'Grabado de iniciales', valor: 'Grabado de iniciales', recargo: 8000 },
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
        monto: 41000,
        tipo: PaymentType.TOTAL,
        metodo: PaymentMethod.EFECTIVO,
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
          { opcion: 'Bordado logo personalizado', valor: 'Bordado logo personalizado', recargo: 10000 },
        ],
      },
    ],
    pagos: [
      {
        monto: 84000,
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

/** Pedidos adicionales generados: repartidos en estados, orígenes, fechas y descuentos. */
async function seedBulkOrders(
  users: Awaited<ReturnType<typeof seedUsers>>,
  generated: GeneratedProduct[],
  promos: Awaited<ReturnType<typeof seedPromotions>>
) {
  const estados = [
    OrderStatus.RECIBIDO,
    OrderStatus.EN_PREPARACION,
    OrderStatus.LISTO,
    OrderStatus.ENTREGADO,
    OrderStatus.CANCELADO,
  ];
  const metodos = [PaymentMethod.EFECTIVO, PaymentMethod.TRANSFERENCIA, PaymentMethod.DEMO];

  // Se evitan los productos que luego recibirán un ajuste de stock bajo (k % 10 === 0).
  const vendibles = generated.filter((_, k) => k % 10 !== 0);
  const poolPromos = [promos.bienvenida, promos.promo5k, ...promos.vigentes.filter(
    (p) => p.codigo !== 'BIENVENIDA10' && p.codigo !== 'PROMO5K'
  )];

  for (let i = 0; i < EXTRA_ORDERS; i++) {
    const estado = estados[i % 5];
    const origen = i % 2 === 0 ? OrderOrigin.WEB : OrderOrigin.POS;
    const vendedor = users.vendedores[i % users.vendedores.length];
    const metodo = metodos[i % metodos.length];

    // 1 a 3 ítems por pedido, con opciones elegidas congeladas (snapshot).
    const items: ItemInput[] = Array.from({ length: 1 + (i % 3) }, (_, j) => {
      const spec = vendibles[(i * 5 + j * 11) % vendibles.length];
      const conPersonalizacion = (i + j) % 2 === 0;
      return {
        product: spec.product,
        cantidad: 1 + ((i + j) % 3),
        elegidas: [
          { opcion: 'Color', valor: COLORES[(i + j) % COLORES.length], recargo: 0 },
          {
            opcion: 'Personalización',
            valor: conPersonalizacion ? 'Con personalización' : 'Sin personalización',
            recargo: conPersonalizacion ? spec.recargoPersonalizacion : 0,
          },
        ],
      };
    });

    // Descuento: promoción vigente si cumple el mínimo; si no, descuento manual del supervisor.
    let descuento: DiscountInput | undefined;
    if (i % 5 !== 4) {
      const promo: Promotion = poolPromos[i % poolPromos.length];
      if (brutoDe(items) >= Number(promo.minimo_compra)) {
        descuento = {
          tipo: DiscountAppliedType.PROMOCION,
          tipoValor: promo.tipo,
          valor: Number(promo.valor),
          promotionId: promo.id,
          codigo: promo.codigo ?? undefined,
        };
      } else {
        descuento = {
          tipo: DiscountAppliedType.MANUAL,
          tipoValor: PromotionType.PORCENTAJE,
          valor: 5,
          razonManual: 'Cortesía autorizada por supervisor',
          autorizadoPorId: users.supervisor.id,
        };
      }
    }

    // Pagos según el estado del pedido.
    let pagos: PaymentInput[] = [];
    if (estado === OrderStatus.EN_PREPARACION) {
      pagos = [{ fraccion: 0.5, tipo: PaymentType.ANTICIPO, metodo, registradoPorId: vendedor.id }];
    } else if (estado === OrderStatus.LISTO) {
      pagos = [{ resto: true, tipo: PaymentType.TOTAL, metodo, registradoPorId: vendedor.id }];
    } else if (estado === OrderStatus.ENTREGADO) {
      pagos = [
        { fraccion: 0.5, tipo: PaymentType.ANTICIPO, metodo, registradoPorId: vendedor.id },
        { resto: true, tipo: PaymentType.SALDO, metodo: PaymentMethod.EFECTIVO, registradoPorId: vendedor.id },
      ];
    }

    const nombre = `${NOMBRES[i % NOMBRES.length]} ${APELLIDOS[(i * 5) % APELLIDOS.length]}`;
    const contacto =
      i % 2 === 0 ? `cliente${pad(i + 1)}@example.com` : `31${String(10000000 + i * 7919).slice(0, 8)}`;

    await createOrder({
      referencia: `FORMA-${1006 + i}`,
      origen,
      estadoPedido: estado,
      clienteNombre: nombre,
      clienteContacto: contacto,
      fechaDeseada: origen === OrderOrigin.WEB ? daysFromNow(3 + (i % 10)) : undefined,
      fecha: daysFromNow(-(i % 28)),
      creadoPorId: vendedor.id,
      items,
      pagos,
      descuento,
    });

    if ((i + 1) % 10 === 0) console.log(`  pedidos generados: ${i + 1}/${EXTRA_ORDERS}`);
  }
}

/** Ajustes de inventario (AJUSTE) que dejan algunos productos con stock bajo el mínimo. */
async function seedInventoryAdjustments(
  generated: GeneratedProduct[],
  users: Awaited<ReturnType<typeof seedUsers>>
) {
  for (const [k, { product }] of generated.entries()) {
    if (k % 10 !== 0) continue;
    const actual = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    const nuevoStock = 2;
    await prisma.inventoryMovement.create({
      data: {
        product_id: product.id,
        tipo: InventoryMovementType.AJUSTE,
        cantidad: nuevoStock - actual.stock_actual,
        motivo: 'Ajuste por conteo físico (seed)',
        usuario_id: users.admin.id,
      },
    });
    await prisma.product.update({ where: { id: product.id }, data: { stock_actual: nuevoStock } });
  }
}

// ───────────────────────────── Main ─────────────────────────────

async function main() {
  console.log('Iniciando carga de datos semilla para la demo de FORMA POS...');
  console.log('Aviso: este seed BORRA los datos existentes antes de cargar los de demo.');

  await clearDatabase();
  console.log('Base limpia. Cargando usuarios, catálogo y promociones...');

  const users = await seedUsers();
  const products = await seedProducts(users.admin.id);
  const promos = await seedPromotions();

  console.log('Cargando pedidos...');
  await seedBaseOrders(users, products.base, promos);
  await seedBulkOrders(users, products.generated, promos);
  await seedInventoryAdjustments(products.generated, users);

  const [usuarios, productos, opciones, pedidos, items, pagos, promociones, descuentos, movimientos, actividad] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.productOption.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.payment.count(),
      prisma.promotion.count(),
      prisma.orderDiscount.count(),
      prisma.inventoryMovement.count(),
      prisma.activityLog.count(),
    ]);

  const conteos: Record<string, number> = {
    User: usuarios,
    Product: productos,
    ProductOption: opciones,
    Order: pedidos,
    OrderItem: items,
    Payment: pagos,
    Promotion: promociones,
    OrderDiscount: descuentos,
    InventoryMovement: movimientos,
    ActivityLog: actividad,
  };

  console.log('Seed completado. Registros por entidad:');
  console.table(conteos);

  const faltantes = Object.entries(conteos).filter(([, n]) => n < 50);
  if (faltantes.length > 0) {
    console.warn('Atención: entidades con menos de 50 registros:', faltantes.map(([nombre]) => nombre).join(', '));
  } else {
    console.log('Todas las entidades tienen al menos 50 registros.');
  }

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
