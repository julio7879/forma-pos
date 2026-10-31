/**
 * Tipos e Interfaces Oficiales del Frontend — Proyecto FORMA (v0.3 Consolidada)
 * Sincronizado 1:1 con `backend/prisma/schema.prisma` y `docs/api-contract.md`.
 */

// ==========================================
// 1. ENUMS DEL NEGOCIO
// ==========================================

export type Role = 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'PREPARADOR';

export type OptionType = 'SELECT' | 'TEXT' | 'COLOR';

export type OrderOrigin = 'WEB' | 'POS';

/**
 * Máquina de estados oficial de pedidos (4 estados progresivos + CANCELADO).
 * Secuencia legal: RECIBIDO -> EN_PREPARACION -> LISTO -> ENTREGADO
 */
export type OrderStatus =
  | 'RECIBIDO'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO';

/**
 * Estado financiero independiente del estado de producción (RF-05, RF-07).
 */
export type PaymentStatus = 'PENDIENTE' | 'ANTICIPO_PARCIAL' | 'PAGADO';

export type PaymentType = 'ANTICIPO' | 'SALDO' | 'TOTAL';

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'DEMO';

export type PromotionType = 'PORCENTAJE' | 'FIJO';

export type DiscountAppliedType = 'PROMOCION' | 'MANUAL';

export type InventoryMovementType = 'ENTRADA' | 'SALIDA_VENTA' | 'AJUSTE';

// ==========================================
// 2. LAS 10 ENTIDADES OFICIALES
// ==========================================

// 1. Usuario (User) — RF-12
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  activo: boolean;
  created_at: string;
}

// Valor individual dentro de `valores_recargos`
export interface OptionValueCharge {
  valor: string;
  recargo: number;
}

// 3. Opción de Personalización (ProductOption) — RF-02
export interface ProductOption {
  id: string;
  product_id: string;
  nombre: string;
  tipo: OptionType;
  obligatorio: boolean;
  valores_recargos: OptionValueCharge[];
}

// 2. Producto (Product) — RF-01, RF-10, RF-14
export interface Product {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  categoria: string;
  precio_base: number;
  stock_actual: number;
  stock_minimo: number;
  activo: boolean;
  created_at?: string;
  options?: ProductOption[];
}

// Snapshot de una elección de personalización congelada al comprar (RF-13)
export interface OrderOptionSnapshot {
  option_id?: string;
  nombre?: string;
  opcion?: string;
  valor: string;
  recargo: number;
}

// 5. Ítem de Pedido (OrderItem) — RF-13 (Snapshot inmutable)
export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  nombre_snapshot: string;
  cantidad: number;
  precio_base_snapshot: number;
  opciones_snapshot: OrderOptionSnapshot[];
  subtotal_item: number;
}

// 6. Registro de Pago (Payment) — RF-07
export interface Payment {
  id: string;
  order_id?: string;
  monto: number;
  tipo: PaymentType;
  metodo: PaymentMethod;
  registrado_por_id?: string | null;
  fecha: string;
}

// 7. Promoción (Promotion) — RF-11
export interface Promotion {
  id: string;
  nombre: string;
  codigo: string | null;
  tipo: PromotionType;
  valor: number;
  alcance: string;
  minimo_compra: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

// 8. Descuento Aplicado (OrderDiscount) — RF-11, RF-13, RF-17
export interface OrderDiscount {
  id: string;
  order_id?: string;
  promotion_id?: string | null;
  codigo_snapshot: string | null;
  tipo: DiscountAppliedType;
  valor_configurado: number;
  monto_descontado: number;
  razon_manual?: string | null;
  autorizado_por_id?: string | null;
  created_at?: string;
}

// 4. Pedido (Order) — RF-03 a RF-08
export interface Order {
  id: string;
  order_id?: string;
  referencia: string;
  origen: OrderOrigin;
  cliente_nombre: string;
  cliente_contacto: string;
  fecha_deseada?: string | null;
  estado_pedido: OrderStatus;
  estado_pago: PaymentStatus;
  subtotal: number;
  total_extras: number;
  total_descuento: number;
  total_final: number;
  total_pagado: number;
  notas?: string | null;
  creado_por_id?: string | null;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  payments?: Payment[];
  discounts?: OrderDiscount[];
}

// 9. Movimiento de Inventario (InventoryMovement) — RF-14
export interface InventoryMovement {
  id: string;
  product_id: string;
  tipo: InventoryMovementType;
  cantidad: number;
  motivo?: string | null;
  usuario_id?: string | null;
  fecha: string;
}

// 10. Registro de Actividad (ActivityLog) — RF-06, RF-10, RF-19
export interface ActivityLog {
  id: string;
  order_id?: string | null;
  usuario_id?: string | null;
  accion: string;
  detalle_anterior?: Record<string, unknown> | null;
  detalle_nuevo?: Record<string, unknown> | null;
  fecha: string;
}

// ==========================================
// 3. RESPUESTA ESTÁNDAR DE LA API Y PAYLOADS
// ==========================================

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
}

export interface OrderOptionSelectionInput {
  option_id?: string;
  nombre?: string;
  opcion?: string;
  valor: string;
}

export interface CreateOrderItemInput {
  product_id: string;
  cantidad: number;
  opciones?: OrderOptionSelectionInput[];
  opciones_seleccionadas?: OrderOptionSelectionInput[];
}

export interface InitialPaymentInput {
  monto: number;
  tipo?: PaymentType;
  metodo: PaymentMethod;
  registrado_por_id?: string;
}

export interface CreateOrderInput {
  origen: OrderOrigin;
  cliente_nombre: string;
  cliente_contacto: string;
  fecha_deseada?: string;
  notas?: string;
  codigo_promocion?: string;
  creado_por_id?: string;
  items: CreateOrderItemInput[];
  pago_inicial?: InitialPaymentInput;
}

export interface UpdateOrderStatusInput {
  estado_pedido: OrderStatus;
  motivo?: string;
  usuario_id?: string;
}

export interface RegisterPaymentInput {
  order_id: string;
  monto: number;
  tipo?: PaymentType;
  metodo: PaymentMethod;
  registrado_por_id?: string;
  monto_recibido?: number;
}

export interface RegisterPaymentResult {
  payment: Payment;
  order: {
    id: string;
    referencia: string;
    total_final: number;
    total_pagado: number;
    saldo_pendiente: number;
    estado_pago: PaymentStatus;
    estado_pedido: OrderStatus;
  };
  cambio_devuelto: number;
}

export interface ValidatePromotionInput {
  codigo: string;
  subtotal_bruto: number;
}

export interface ValidatePromotionResult {
  valida: boolean;
  promotion: Promotion;
  monto_descontado: number;
  total_con_descuento: number;
}

export interface DashboardStats {
  total_facturado: number;
  total_recaudado: number;
  pedidos_por_estado: Record<OrderStatus, number>;
  pedidos_saldo_pendiente: number;
  alertas_stock_bajo: Product[];
  pedidos_recientes: Order[];
}
