import { Request, Response, NextFunction } from 'express';

// Respuestas de error estandarizadas para el frontend
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Error Handler]:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Ocurrió un error inesperado en el servidor';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}
