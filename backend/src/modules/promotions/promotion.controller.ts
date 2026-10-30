import { Request, Response, NextFunction } from 'express';
import * as promotionService from './promotion.service';

export async function listPromotionsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promotions = await promotionService.listActivePromotions();
    return res.status(200).json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    return next(error);
  }
}

export async function validatePromotionHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { codigo, monto_compra } = req.body ?? {};
    const result = await promotionService.validatePromotion({ codigo, monto_compra });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
