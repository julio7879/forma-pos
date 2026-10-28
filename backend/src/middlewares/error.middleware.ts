import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Middleware para rutas no encontradas (404)
export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `La ruta ${req.method} ${req.originalUrl} no existe en el servidor`
    }
  });
}

// Respuestas de error estandarizadas según docs/api-contract.md
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Captura de JSON malformado en el body
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'El cuerpo de la petición no contiene un JSON válido'
      }
    });
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message =
    err instanceof AppError || statusCode < 500
      ? err.message
      : 'Ocurrió un error interno en el servidor';

  if (statusCode >= 500) {
    console.error('[Error Handler]:', err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}
