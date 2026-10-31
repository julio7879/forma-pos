/**
 * Cliente HTTP Unificado y Servicios de Dominio — Proyecto FORMA
 * Conecta el Frontend con el Backend Express (`/api/*`) y provee fallback
 * resiliente a `mockData.ts` en caso de que el servidor local esté apagado.
 */

import {
  ApiResponse,
  CreateOrderInput,
  DashboardStats,
  Order,
  OrderStatus,
  Payment,
  PaymentStatus,
  Product,
  Promotion,
  RegisterPaymentInput,
  RegisterPaymentResult,
  Role,
  UpdateOrderStatusInput,
  ValidatePromotionInput,
  ValidatePromotionResult,
} from '../types';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_PROMOTIONS,
} from './mockData';

// URL Base configurable por entorno Vite
const envApiUrl = (import.meta as unknown as { env?: Record<string, string> })
  .env?.VITE_API_URL;
export const API_BASE_URL = envApiUrl || 'http://localhost:3000/api';

const DEFAULT_TIMEOUT_MS = 8000;

// Estado en memoria / localStorage para el rol activo en POS y Admin (RF-12)
let activeUserRole: Role = 'VENDEDOR';

export function setCurrentRole(role: Role): void {
  activeUserRole = role;
  try {
    localStorage.setItem('forma_user_role', role);
  } catch {
    // Ignorar en entornos sin acceso a localStorage
  }
}

export function getCurrentRole(): Role {
  try {
    const saved = localStorage.getItem('forma_user_role') as Role | null;
    if (
      saved &&
      ['ADMIN', 'SUPERVISOR', 'VENDEDOR', 'PREPARADOR'].includes(saved)
    ) {
      return saved;
    }
  } catch {
    // Fallback al estado en memoria
  }
  return activeUserRole;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = 'API_ERROR', status = 500) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  role?: Role;
  timeoutMs?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, role, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } =
    options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const effectiveRole = role || getCurrentRole();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': effectiveRole,
    ...(headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      const errCode = payload.error?.code || `HTTP_${response.status}`;
      const errMsg =
        payload.error?.message ||
        `Error en la petición (${response.status} ${response.statusText})`;
      throw new ApiClientError(errMsg, errCode, response.status);
    }

    return payload.data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  del: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// =========================================================
// SERVICIOS MODULARIZADOS CON FALLBACK OFFLINE A MOCKS
// =========================================================

let localOrdersStore: Order[] = [...MOCK_ORDERS];

function isNetworkOrOfflineError(error: unknown): boolean {
  if (error instanceof ApiClientError) return false;
  return true;
}

export const productService = {
  async getProducts(filters?: {
    categoria?: string;
    limit?: number;
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.categoria) params.set('categoria', filters.categoria);
      if (filters?.limit) params.set('limit', String(filters.limit));
      const query = params.toString();
      return await apiClient.get<Product[]>(
        `/products${query ? `?${query}` : ''}`
      );
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      let list = MOCK_PRODUCTS.filter((p) => p.activo);
      if (filters?.categoria) {
        const cat = filters.categoria.toLowerCase();
        list = list.filter((p) => p.categoria.toLowerCase() === cat);
      }
      if (filters?.limit) {
        list = list.slice(0, filters.limit);
      }
      return list;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      if (!found) {
        throw new ApiClientError('Producto no encontrado', 'NOT_FOUND', 404);
      }
      return found;
    }
  },
};

export const orderService = {
  async getOrders(filters?: {
    estado_pedido?: OrderStatus;
    estado_pago?: PaymentStatus;
  }): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.estado_pedido)
        params.set('estado_pedido', filters.estado_pedido);
      if (filters?.estado_pago) params.set('estado_pago', filters.estado_pago);
      const query = params.toString();
      return await apiClient.get<Order[]>(
        `/orders${query ? `?${query}` : ''}`
      );
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      let result = [...localOrdersStore];
      if (filters?.estado_pedido) {
        result = result.filter(
          (o) => o.estado_pedido === filters.estado_pedido
        );
      }
      if (filters?.estado_pago) {
        result = result.filter((o) => o.estado_pago === filters.estado_pago);
      }
      return result;
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      return await apiClient.get<Order>(`/orders/${id}`);
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const found = localOrdersStore.find(
        (o) => o.id === id || o.referencia === id
      );
      if (!found) {
        throw new ApiClientError('Pedido no encontrado', 'ORDER_NOT_FOUND', 404);
      }
      return found;
    }
  },

  async trackOrder(referencia: string, contacto?: string): Promise<Order> {
    try {
      const query = contacto
        ? `?contacto=${encodeURIComponent(contacto)}`
        : '';
      return await apiClient.get<Order>(
        `/orders/tracking/${encodeURIComponent(referencia.trim())}${query}`
      );
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const cleanRef = referencia.trim().toUpperCase();
      const found = localOrdersStore.find(
        (o) => o.referencia.toUpperCase() === cleanRef
      );
      if (!found) {
        throw new ApiClientError(
          'No se encontró ningún pedido con esa referencia.',
          'ORDER_NOT_FOUND',
          404
        );
      }
      return found;
    }
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    try {
      return await apiClient.post<Order>('/orders', input);
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      // Simulación offline fiel a la regla de negocio RF-02 y RF-13
      let subtotal = 0;
      let totalExtras = 0;
      const builtItems = input.items.map((itemInput, idx) => {
        const prod =
          MOCK_PRODUCTS.find((p) => p.id === itemInput.product_id) ||
          MOCK_PRODUCTS[0];
        const selections =
          itemInput.opciones || itemInput.opciones_seleccionadas || [];
        const snapshots = selections.map((sel) => {
          const optGroup = prod.options?.find(
            (o) =>
              o.id === sel.option_id ||
              o.nombre === sel.nombre ||
              o.nombre === sel.opcion
          );
          const valObj = optGroup?.valores_recargos.find(
            (v) => v.valor === sel.valor
          );
          return {
            opcion: optGroup?.nombre || sel.opcion || sel.nombre || 'Opción',
            valor: sel.valor,
            recargo: valObj?.recargo || 0,
          };
        });
        const extrasUnit = snapshots.reduce((acc, s) => acc + s.recargo, 0);
        subtotal += prod.precio_base * itemInput.cantidad;
        totalExtras += extrasUnit * itemInput.cantidad;
        return {
          id: `item-mock-${Date.now()}-${idx}`,
          product_id: prod.id,
          nombre_snapshot: prod.nombre,
          cantidad: itemInput.cantidad,
          precio_base_snapshot: prod.precio_base,
          opciones_snapshot: snapshots,
          subtotal_item: (prod.precio_base + extrasUnit) * itemInput.cantidad,
        };
      });

      const totalBruto = subtotal + totalExtras;
      let totalDescuento = 0;
      if (input.codigo_promocion) {
        const promo = MOCK_PROMOTIONS.find(
          (p) =>
            p.codigo?.toUpperCase() ===
              input.codigo_promocion?.trim().toUpperCase() && p.activo
        );
        if (promo && totalBruto >= promo.minimo_compra) {
          totalDescuento =
            promo.tipo === 'PORCENTAJE'
              ? Math.round((totalBruto * promo.valor) / 100)
              : promo.valor;
        }
      }

      const totalFinal = Math.max(0, totalBruto - totalDescuento);
      const pagoInicialMonto = input.pago_inicial?.monto || 0;
      const estadoPago: PaymentStatus =
        pagoInicialMonto <= 0
          ? 'PENDIENTE'
          : pagoInicialMonto >= totalFinal
            ? 'PAGADO'
            : 'ANTICIPO_PARCIAL';

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        referencia: `FORMA-${Math.floor(1000 + Math.random() * 9000)}`,
        origen: input.origen,
        cliente_nombre: input.cliente_nombre,
        cliente_contacto: input.cliente_contacto,
        fecha_deseada: input.fecha_deseada || null,
        estado_pedido: 'RECIBIDO',
        estado_pago: estadoPago,
        subtotal,
        total_extras: totalExtras,
        total_descuento: totalDescuento,
        total_final: totalFinal,
        total_pagado: Math.min(totalFinal, pagoInicialMonto),
        notas: input.notas || null,
        created_at: new Date().toISOString(),
        items: builtItems,
        payments:
          pagoInicialMonto > 0 && input.pago_inicial
            ? [
                {
                  id: `pay-${Date.now()}`,
                  monto: Math.min(totalFinal, pagoInicialMonto),
                  tipo:
                    pagoInicialMonto >= totalFinal ? 'TOTAL' : 'ANTICIPO',
                  metodo: input.pago_inicial.metodo,
                  fecha: new Date().toISOString(),
                },
              ]
            : [],
        discounts: [],
      };

      localOrdersStore = [newOrder, ...localOrdersStore];
      return newOrder;
    }
  },

  async updateOrderStatus(
    id: string,
    input: UpdateOrderStatusInput
  ): Promise<Order> {
    try {
      return await apiClient.patch<Order>(`/orders/${id}/status`, input);
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const idx = localOrdersStore.findIndex((o) => o.id === id);
      if (idx === -1) {
        throw new ApiClientError('Pedido no encontrado', 'ORDER_NOT_FOUND', 404);
      }
      const current = localOrdersStore[idx];
      if (
        input.estado_pedido === 'ENTREGADO' &&
        current.estado_pago !== 'PAGADO'
      ) {
        throw new ApiClientError(
          'No se puede entregar un pedido con saldo pendiente.',
          'ORDER_PENDING_PAYMENT',
          400
        );
      }
      const updated: Order = {
        ...current,
        estado_pedido: input.estado_pedido,
        updated_at: new Date().toISOString(),
      };
      localOrdersStore[idx] = updated;
      return updated;
    }
  },
};

export const paymentService = {
  async registerPayment(
    input: RegisterPaymentInput
  ): Promise<RegisterPaymentResult> {
    try {
      return await apiClient.post<RegisterPaymentResult>('/payments', input);
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const idx = localOrdersStore.findIndex((o) => o.id === input.order_id);
      if (idx === -1) {
        throw new ApiClientError('Pedido no encontrado', 'ORDER_NOT_FOUND', 404);
      }
      const order = localOrdersStore[idx];
      const nuevoTotalPagado = Math.min(
        order.total_final,
        order.total_pagado + input.monto
      );
      const saldoPendiente = Math.max(0, order.total_final - nuevoTotalPagado);
      const nuevoEstadoPago: PaymentStatus =
        saldoPendiente === 0 ? 'PAGADO' : 'ANTICIPO_PARCIAL';

      const payment: Payment = {
        id: `pay-${Date.now()}`,
        order_id: order.id,
        monto: input.monto,
        tipo:
          input.tipo || (saldoPendiente === 0 ? 'SALDO' : 'ANTICIPO'),
        metodo: input.metodo,
        fecha: new Date().toISOString(),
      };

      const updatedOrder: Order = {
        ...order,
        total_pagado: nuevoTotalPagado,
        estado_pago: nuevoEstadoPago,
        payments: [...(order.payments || []), payment],
      };
      localOrdersStore[idx] = updatedOrder;

      const cambio =
        input.monto_recibido && input.monto_recibido > input.monto
          ? input.monto_recibido - input.monto
          : 0;

      return {
        payment,
        order: {
          id: updatedOrder.id,
          referencia: updatedOrder.referencia,
          total_final: updatedOrder.total_final,
          total_pagado: updatedOrder.total_pagado,
          saldo_pendiente: saldoPendiente,
          estado_pago: nuevoEstadoPago,
          estado_pedido: updatedOrder.estado_pedido,
        },
        cambio_devuelto: cambio,
      };
    }
  },

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    try {
      return await apiClient.get<Payment[]>(`/payments/order/${orderId}`);
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const order = localOrdersStore.find((o) => o.id === orderId);
      return order?.payments || [];
    }
  },
};

export const promotionService = {
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      return await apiClient.get<Promotion[]>('/promotions');
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      return MOCK_PROMOTIONS.filter((p) => p.activo);
    }
  },

  async validateCoupon(
    input: ValidatePromotionInput
  ): Promise<ValidatePromotionResult> {
    try {
      return await apiClient.post<ValidatePromotionResult>(
        '/promotions/validate',
        input
      );
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      const cleanCode = input.codigo.trim().toUpperCase();
      const promo = MOCK_PROMOTIONS.find(
        (p) => p.codigo?.toUpperCase() === cleanCode && p.activo
      );
      if (!promo) {
        throw new ApiClientError(
          'El código promocional no existe o no está activo.',
          'INVALID_COUPON',
          404
        );
      }
      if (input.subtotal_bruto < promo.minimo_compra) {
        throw new ApiClientError(
          `El pedido requiere un monto mínimo de $${promo.minimo_compra.toLocaleString('es-CO')} para aplicar este cupón.`,
          'MIN_PURCHASE_NOT_MET',
          400
        );
      }
      const descuento =
        promo.tipo === 'PORCENTAJE'
          ? Math.round((input.subtotal_bruto * promo.valor) / 100)
          : promo.valor;
      return {
        valida: true,
        promotion: promo,
        monto_descontado: descuento,
        total_con_descuento: Math.max(0, input.subtotal_bruto - descuento),
      };
    }
  },
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      return await apiClient.get<DashboardStats>('/dashboard/stats', {
        role: 'ADMIN',
      });
    } catch (error) {
      if (!isNetworkOrOfflineError(error)) throw error;
      return MOCK_DASHBOARD_STATS;
    }
  },
};

export default apiClient;
