import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';

export async function getDashboardStatsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
}