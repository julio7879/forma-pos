import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';

export async function createPaymentHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await paymentService.createPayment(req.body ?? {});
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPaymentsByOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { orderId } = req.params;
    const result = await paymentService.getPaymentsByOrder(orderId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
