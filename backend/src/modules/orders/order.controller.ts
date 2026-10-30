import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@prisma/client';
import * as orderService from './order.service';

export async function createOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await orderService.createOrder(req.body);
    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listOrdersHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { estado_pedido, estado_pago, origen, limit } = req.query;
    const orders = await orderService.listOrders({
      estado_pedido: typeof estado_pedido === 'string' ? estado_pedido : undefined,
      estado_pago: typeof estado_pago === 'string' ? estado_pago : undefined,
      origen: typeof origen === 'string' ? origen : undefined,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    });
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await orderService.getOrderByIdOrReference(req.params.id);
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function trackOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { referencia } = req.params;
    const contacto =
      typeof req.query.contacto === 'string' ? req.query.contacto : undefined;
    const order = await orderService.trackOrderByReference(
      referencia,
      contacto
    );
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { estado_pedido, usuario_id, motivo } = req.body ?? {};
    const rawHeader = req.headers['x-user-role'];
    const userRole = typeof rawHeader === 'string' ? rawHeader.trim().toUpperCase() : undefined;

    const updated = await orderService.updateOrderStatus(
      id,
      estado_pedido as OrderStatus,
      usuario_id,
      motivo,
      userRole
    );
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}
