export interface PriceCalculationItem {
  basePrice: number;
  extrasPrice?: number;
  quantity: number;
}

/**
 * Fuente única de verdad para el cálculo de precios:
 * Total = (base + extras) * cantidad - descuento
 */
export function calculateItemSubtotal(item: PriceCalculationItem): number {
  const base = Number(item.basePrice) || 0;
  const extras = Number(item.extrasPrice) || 0;
  const qty = Number(item.quantity) || 1;
  return (base + extras) * qty;
}

export function calculateOrderTotal(
  items: PriceCalculationItem[],
  discount: number = 0
): { subtotal: number; discount: number; total: number } {
  const subtotal = items.reduce((sum, it) => sum + calculateItemSubtotal(it), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  return { subtotal, discount, total };
}
