import { Router } from 'express';
import {
  createPaymentHandler,
  getPaymentsByOrderHandler,
} from './payment.controller';

export const paymentRouter = Router();

// Registrar anticipo o pago completo de un pedido (RF-06, RF-07)
paymentRouter.post('/', createPaymentHandler);

// Consultar pagos y balance de un pedido por ID o Referencia
paymentRouter.get('/order/:orderId', getPaymentsByOrderHandler);

export default paymentRouter;
