# CLAUDE.md — Guía Oficial del Proyecto FORMA (v0.3)

Lee y respeta estrictamente el contrato completo en [`docs/CONTEXTO_IA_EQUIPO.md`](./docs/CONTEXTO_IA_EQUIPO.md) y las reglas de flujo en [`AGENTS.md`](./AGENTS.md).

## Reglas Críticas de Ingeniería
1. **Ramas protegidas:** Nunca hagas commits ni push directos a `main` ni a `develop`. Toda tarea usa una rama `feature/<issue>-<slug>`, `fix/<issue>-<slug>` o `docs/<issue>-<slug>` creada desde `develop`.
2. **Modelo de 10 Entidades en Prisma:** Usa exactamente los modelos y nombres de campos definidos en `backend/prisma/schema.prisma` (`User`, `Product`, `ProductOption`, `Order`, `OrderItem`, `Payment`, `Promotion`, `OrderDiscount`, `InventoryMovement`, `ActivityLog`).
3. **Candados de Negocio:**
   - **Precios (RF-02):** Solo `backend/src/utils/priceCalculator.ts` es fuente de verdad para totales.
   - **Estados separados (RF-05, RF-07):** `Order.estado_pedido` y `Order.estado_pago` son independientes.
   - **Snapshots inmutables (RF-13):** `OrderItem` y `OrderDiscount` congelan precios, nombres y opciones al crear el pedido.
   - **Roles en servidor (RF-12):** Usa siempre `requireRole([...])` en rutas protegidas.
4. **Comandos de Verificación:**
   - Backend: `cd backend && npm run build`
   - Frontend: `cd frontend && npm run build`
