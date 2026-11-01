import { Router } from 'express';
import { requireRole } from '../../middlewares/authRole.middleware';
import { getDashboardStatsHandler } from './dashboard.controller';

export const dashboardRouter = Router();

// KPIs operativos, alertas y pedidos recientes. Solo ADMIN y SUPERVISOR (RF-12).
dashboardRouter.get(
  '/stats',
  requireRole(['ADMIN', 'SUPERVISOR']),
  getDashboardStatsHandler
);

export default dashboardRouter;