import { OrderStatus, PaymentStatus } from '@prisma/client';
import prisma from '../../config/prisma';

// Estados operativos que se reportan en el conteo (RF-05).
const REPORTED_STATUSES: OrderStatus[] = [
  OrderStatus.RECIBIDO,
  OrderStatus.EN_PREPARACION,
  OrderStatus.LISTO,
  OrderStatus.ENTREGADO,
];

/**
 * GET /api/dashboard/stats
 * KPIs operativos, alertas y pedidos recientes (RF-10).
 */
export async function getDashboardStats() {
  const [facturado, recaudado, porEstado, pendientesPago, productosActivos, recientes] =
    await Promise.all([
      // Total facturado: pedidos no cancelados.
      prisma.order.aggregate({
        _sum: { total_final: true },
        where: { estado_pedido: { not: OrderStatus.CANCELADO } },
      }),
      // Total recaudado en caja.
      prisma.order.aggregate({
        _sum: { total_pagado: true },
      }),
      // Conteo por estado de pedido.
      prisma.order.groupBy({
        by: ['estado_pedido'],
        _count: { _all: true },
      }),
      // Pedidos con saldo pendiente (los cancelados no cuentan como deuda).
      prisma.order.count({
        where: {
          estado_pago: { not: PaymentStatus.PAGADO },
          estado_pedido: { not: OrderStatus.CANCELADO },
        },
      }),
      // Prisma no compara columna contra columna, así que el stock bajo se filtra aquí.
      prisma.product.findMany({
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          categoria: true,
          stock_actual: true,
          stock_minimo: true,
        },
        orderBy: { nombre: 'asc' },
      }),
      // Últimos 5 pedidos creados.
      prisma.order.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          referencia: true,
          cliente_nombre: true,
          total_final: true,
          estado_pedido: true,
          estado_pago: true,
          created_at: true,
        },
      }),
    ]);

  const pedidosPorEstado = REPORTED_STATUSES.reduce<Record<string, number>>(
    (acc, estado) => {
      acc[estado] = 0;
      return acc;
    },
    {}
  );
  for (const row of porEstado) {
    if (row.estado_pedido in pedidosPorEstado) {
      pedidosPorEstado[row.estado_pedido] = row._count._all;
    }
  }

  const productosStockBajo = productosActivos.filter(
    (p) => p.stock_actual <= p.stock_minimo
  );

  return {
    total_facturado: Number(facturado._sum.total_final ?? 0),
    total_recaudado: Number(recaudado._sum.total_pagado ?? 0),
    pedidos_por_estado: pedidosPorEstado,
    alertas: {
      pedidos_con_saldo_pendiente: pendientesPago,
      productos_stock_bajo: productosStockBajo,
    },
    pedidos_recientes: recientes.map((o) => ({
      id: o.id,
      referencia: o.referencia,
      cliente_nombre: o.cliente_nombre,
      total_final: Number(o.total_final),
      estado_pedido: o.estado_pedido,
      estado_pago: o.estado_pago,
      created_at: o.created_at,
    })),
  };
}