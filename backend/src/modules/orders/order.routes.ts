import { Router } from 'express';
import {
  createOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  trackOrderHandler,
  updateOrderStatusHandler,
} from './order.controller';
import { requireRole } from '../../middlewares/authRole.middleware';

export const orderRouter = Router();

// Crear nuevo pedido desde WEB o POS (recalcula precios en backend - RF-02, RF-13)
orderRouter.post('/', createOrderHandler);

// Listar pedidos con filtros opcionales (?estado_pedido=..., ?estado_pago=..., ?origen=...)
orderRouter.get('/', listOrdersHandler);

// Consulta pública de tracking por código de referencia (ej. /api/orders/track/FORMA-1001) - RF-08
orderRouter.get('/track/:referencia', trackOrderHandler);

// Consultar detalle de pedido por ID o referencia (GET /api/orders/:id)
orderRouter.get('/:id', getOrderHandler);

// Actualizar estado operativo del pedido protegido por rol - RF-06, RF-12
orderRouter.patch(
  '/:id/status',
  requireRole(['ADMIN', 'SUPERVISOR', 'VENDEDOR', 'PREPARADOR']),
  updateOrderStatusHandler
);

export default orderRouter;
