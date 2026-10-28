# 🧠 Contexto Maestro Multi-IA — Equipo FORMA (ChatGPT · Claude · Gemini)

> **Instrucción para el equipo:** Pega este documento al inicio de cualquier sesión con ChatGPT, Claude o Gemini (o déjalo en la raíz del proyecto para agentes de código). Ninguna IA debe inventar nombres de tablas, campos, rutas ni carpetas fuera de este contrato oficial (v0.3).

---

## 1. Regla de Flujo Git Flow del Equipo
1. **Ramas protegidas:** Nadie hace commits ni push directo a `main` ni a `develop`.
2. **Creación de rama:** Toda tarea parte de `develop` vinculada a su número de Issue:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<numero-issue>-<descripcion-corta>
   ```
3. **Pull Requests:** Todo PR apunta hacia `develop`, incluye `Closes #<numero-issue>` y completa la plantilla automática de evidencia (`.github/pull_request_template.md`).
4. **Cero Secretos:** Jamás subir archivos `.env`, tokens ni credenciales reales.

---

## 2. Fronteras Estrictas del Monorepo por Integrante

| Integrante | Rol | Carpetas y Archivos Exclusivos |
| :--- | :--- | :--- |
| **Julio** | Líder + Backend | `backend/src/modules/{promotions,dashboard,users}/`, `backend/src/middlewares/`, `backend/src/utils/`, `backend/src/{app,server}.ts` |
| **Sofía** | Diseño + Frontend Store | `frontend/src/modules/store/`, `frontend/src/components/ui/`, `frontend/tailwind.config.js`, `docs/design-tokens.md` |
| **Esneider** | Diseño + Frontend POS & Admin | `frontend/src/modules/{pos,admin}/`, `frontend/src/components/ui/`, `frontend/src/components/layout/` |
| **Duvan** | Base de Datos (Prisma) | `backend/prisma/{schema.prisma,migrations,seed.ts}` |
| **Yeimer** | Backend de Datos | `backend/src/modules/{products,orders,payments}/`, `docs/api-contract.md` |
| **Thomas** | QA / Tester | `docs/qa-test-matrix.md`, validación de endpoints, Prisma Studio y flujos de UI |

---

## 3. Candados de Negocio Obligatorios (Inquebrantables)

1. **RF-02 (Fuente única de verdad en precios):** El frontend **jamás** calcula el total final como fuente de verdad; solo muestra previsualizaciones. El backend siempre recalcula en `backend/src/utils/priceCalculator.ts`:
   `total_final = ((precio_base + suma_recargos) * cantidad) - total_descuento`.
2. **RF-03, RF-05, RF-07 (Estados independientes en `Order`):** Todo pedido distingue `origen` (`WEB` | `POS`) y mantiene separados `estado_pedido` (`RECIBIDO`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`, `CANCELADO`) y `estado_pago` (`PENDIENTE`, `ANTICIPO_PARCIAL`, `PAGADO`).
3. **RF-11 (No acumulación de promociones):** Un pedido solo puede tener una promoción o descuento manual activo a la vez, validando vigencia y monto mínimo.
4. **RF-12 (Seguridad de roles en Backend):** Ocultar un botón en React no protege la ruta. Todo endpoint privado debe usar el middleware `requireRole([...])` validando `ADMIN`, `SUPERVISOR`, `VENDEDOR` o `PREPARADOR`.
5. **RF-13 (Snapshots inmutables):** `OrderItem` y `OrderDiscount` guardan copias congeladas (`nombre_snapshot`, `precio_base_snapshot`, `opciones_snapshot`, `codigo_snapshot`) para que cambios futuros en el catálogo no alteren pedidos históricos.

---

## 4. Contrato Oficial de las 10 Entidades en Prisma (`schema.prisma`)

1. **`User`**: `id`, `nombre`, `email`, `password_hash`, `rol` (`ADMIN`, `SUPERVISOR`, `VENDEDOR`, `PREPARADOR`), `activo`, `created_at`.
2. **`Product`**: `id`, `nombre`, `descripcion`, `imagen_url`, `categoria`, `precio_base`, `stock_actual`, `stock_minimo`, `activo`, `created_at`.
3. **`ProductOption`**: `id`, `product_id`, `nombre`, `tipo` (`SELECT`, `TEXT`, `COLOR`), `obligatorio`, `valores_recargos` (JSON con valor y recargo).
4. **`Order`**: `id`, `referencia` (única, ej. `FORMA-1042`), `origen` (`WEB`, `POS`), `cliente_nombre`, `cliente_contacto`, `fecha_deseada`, `estado_pedido`, `estado_pago`, `subtotal`, `total_extras`, `total_descuento`, `total_final`, `total_pagado`, `notas`, `creado_por_id`, `created_at`.
5. **`OrderItem`**: `id`, `order_id`, `product_id`, `nombre_snapshot`, `cantidad`, `precio_base_snapshot`, `opciones_snapshot` (JSON), `subtotal_item`.
6. **`Payment`**: `id`, `order_id`, `monto`, `tipo` (`ANTICIPO`, `SALDO`, `TOTAL`), `metodo` (`EFECTIVO`, `TRANSFERENCIA`, `DEMO`), `registrado_por_id`, `fecha`.
7. **`Promotion`**: `id`, `nombre`, `codigo` (único opcional), `tipo` (`PORCENTAJE`, `FIJO`), `valor`, `alcance`, `minimo_compra`, `fecha_inicio`, `fecha_fin`, `activo`.
8. **`OrderDiscount`**: `id`, `order_id`, `promotion_id` (opcional), `codigo_snapshot`, `tipo` (`PROMOCION`, `MANUAL`), `valor_configurado`, `monto_descontado`, `razon_manual`, `autorizado_por_id`.
9. **`InventoryMovement`**: `id`, `product_id`, `tipo` (`ENTRADA`, `SALIDA_VENTA`, `AJUSTE`), `cantidad`, `motivo`, `usuario_id`, `fecha`.
10. **`ActivityLog`**: `id`, `order_id` (opcional), `usuario_id` (opcional), `accion`, `detalle_anterior` (JSON), `detalle_nuevo` (JSON), `fecha`.

---

## 5. Formato Estándar de Respuestas HTTP (`/api/*`)

- **Éxito (`200` / `201`):**
  ```json
  { "success": true, "data": { ... } }
  ```
- **Error (`400` / `401` / `403` / `404` / `500`):**
  ```json
  { "success": false, "error": { "code": "CODIGO_ERROR", "message": "Mensaje legible" } }
  ```
