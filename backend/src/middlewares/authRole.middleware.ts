import { Request, Response, NextFunction } from 'express';

export type BusinessRole = 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'PREPARADOR';

export const VALID_ROLES: BusinessRole[] = [
  'ADMIN',
  'SUPERVISOR',
  'VENDEDOR',
  'PREPARADOR'
];

// Validación obligatoria en servidor de roles de negocio (ADMIN, SUPERVISOR, VENDEDOR, PREPARADOR)
export function requireRole(allowedRoles: BusinessRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawHeader = req.headers['x-user-role'];
    const userRole = typeof rawHeader === 'string' ? rawHeader.trim().toUpperCase() : '';

    if (!userRole || !VALID_ROLES.includes(userRole as BusinessRole)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Se requiere un rol de usuario válido en la cabecera x-user-role'
        }
      });
    }

    if (!allowedRoles.includes(userRole as BusinessRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `El rol ${userRole} no tiene permisos para ejecutar esta operación`
        }
      });
    }

    next();
  };
}
