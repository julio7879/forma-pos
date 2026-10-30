import { Prisma, PromotionType } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';

export interface ValidatePromotionInput {
  codigo?: unknown;
  monto_compra?: unknown;
}

// Códigos permitidos: letras, números, guion y guion bajo (ej. BIENVENIDA10, PROMO5K).
const CODE_PATTERN = /^[A-Z0-9_-]{1,50}$/;

/** Formatea un monto en pesos con separador de miles (ej. 50000 -> "$50.000"). */
function formatCOP(amount: number): string {
  return `$${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

type PromotionRecord = Prisma.PromotionGetPayload<Record<string, never>>;

/** Convierte los campos Decimal de Prisma a números para la respuesta JSON. */
function formatPromotion(promo: PromotionRecord) {
  return {
    id: promo.id,
    nombre: promo.nombre,
    codigo: promo.codigo,
    tipo: promo.tipo,
    valor: Number(promo.valor),
    alcance: promo.alcance,
    minimo_compra: Number(promo.minimo_compra),
    fecha_inicio: promo.fecha_inicio,
    fecha_fin: promo.fecha_fin,
    activo: promo.activo,
  };
}

/**
 * GET /api/promotions
 * Lista las promociones activas y vigentes en la fecha actual (RF-11).
 */
export async function listActivePromotions() {
  const now = new Date();

  const promotions = await prisma.promotion.findMany({
    where: {
      activo: true,
      fecha_inicio: { lte: now },
      fecha_fin: { gte: now },
    },
    orderBy: [{ fecha_fin: 'asc' }, { nombre: 'asc' }],
  });

  return promotions.map(formatPromotion);
}

/**
 * POST /api/promotions/validate
 * Valida UN cupón (RF-11: no hay acumulación) contra existencia, estado, vigencia
 * y monto mínimo de compra, y devuelve el ahorro estimado.
 * Usa la misma regla de descuento que la creación de pedidos.
 */
export async function validatePromotion(input: ValidatePromotionInput) {
  // 1. Un solo código por validación (RF-11).
  if (typeof input.codigo !== 'string' || !input.codigo.trim()) {
    throw new AppError(
      'Debes enviar un único código de cupón en el campo "codigo".',
      400,
      'PROMOTION_INVALID'
    );
  }

  const codigo = input.codigo.trim().toUpperCase();
  if (!CODE_PATTERN.test(codigo)) {
    throw new AppError(
      'Código de cupón inválido. Solo se permite un cupón por validación; no se pueden acumular promociones.',
      400,
      'PROMOTION_INVALID'
    );
  }

  // 2. Monto de compra numérico y no negativo.
  const montoCompra =
    typeof input.monto_compra === 'number'
      ? input.monto_compra
      : typeof input.monto_compra === 'string' && input.monto_compra.trim() !== ''
        ? Number(input.monto_compra)
        : NaN;

  if (!Number.isFinite(montoCompra) || montoCompra < 0) {
    throw new AppError(
      'El campo "monto_compra" debe ser un número mayor o igual a 0.',
      400,
      'INVALID_PURCHASE_AMOUNT'
    );
  }

  // 3. Existencia y estado.
  const promo = await prisma.promotion.findUnique({ where: { codigo } });

  if (!promo || !promo.activo) {
    throw new AppError(
      `El cupón "${codigo}" no existe o no está activo.`,
      400,
      'PROMOTION_INVALID'
    );
  }

  // 4. Vigencia.
  const now = new Date();
  if (now < promo.fecha_inicio) {
    throw new AppError(
      `El cupón "${codigo}" aún no está vigente.`,
      400,
      'PROMOTION_INVALID'
    );
  }
  if (now > promo.fecha_fin) {
    throw new AppError(`Cupón vencido: "${codigo}".`, 400, 'PROMOTION_INVALID');
  }

  // 5. Monto mínimo de compra.
  const minimoCompra = Number(promo.minimo_compra);
  if (montoCompra < minimoCompra) {
    throw new AppError(
      `El monto mínimo de compra es ${formatCOP(minimoCompra)}.`,
      400,
      'PROMOTION_INVALID'
    );
  }

  // 6. Descuento calculado (misma regla que order.service.ts).
  const valor = Number(promo.valor);
  const ahorroEstimado =
    promo.tipo === PromotionType.PORCENTAJE
      ? Math.round((montoCompra * valor) / 100)
      : Math.min(montoCompra, Math.round(valor));

  return {
    valido: true,
    promocion_id: promo.id,
    codigo: promo.codigo,
    nombre: promo.nombre,
    tipo: promo.tipo,
    valor,
    minimo_compra: minimoCompra,
    monto_compra: montoCompra,
    ahorro_estimado: ahorroEstimado,
    total_estimado: Math.max(0, montoCompra - ahorroEstimado),
  };
}
