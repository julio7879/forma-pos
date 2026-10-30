import { Router } from 'express';
import {
  listPromotionsHandler,
  validatePromotionHandler,
} from './promotion.controller';

export const promotionRouter = Router();

// Lista promociones activas y vigentes hoy (carrito web y POS) - RF-11
promotionRouter.get('/', listPromotionsHandler);

// Valida un cupón (vigencia y monto mínimo) y calcula el ahorro estimado - RF-11
promotionRouter.post('/validate', validatePromotionHandler);

export default promotionRouter;
