/**
 * Generador de referencias únicas legibles para pedidos (ej. FORMA-1042)
 */
export function generateOrderReference(prefix: string = 'FORMA'): string {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomPart}`;
}
