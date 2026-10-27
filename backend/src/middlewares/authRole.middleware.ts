import { Request, Response, NextFunction } from 'express';

// Validación en servidor de roles: ADMIN, SUPERVISOR, VENDEDOR, PREPARADOR
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers['x-user-role'] as string;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para realizar esta acción'
        }
      });
    }

    next();
  };
}
