---
name: forma-sincronizador-api
description: Sincroniza contratos JSON en docs/api-contract.md, interfaces TypeScript en frontend/src/types/ y consultas Prisma para evitar discrepancias de nombres de campos entre ChatGPT, Claude y Gemini.
---

# FORMA Sincronizador de API Multi-IA

## Objetivo
Evitar que las distintas IAs del equipo (ChatGPT, Claude, Gemini) inventen nombres de campos, tablas o payloads incompatibles entre frontend y backend.

## Reglas de Sincronización
Antes de implementar o documentar cualquier módulo (Catálogo, Configurador, Pedidos, Pagos, Promociones o Dashboard):
1. **Fuente de verdad de datos:** Inspecciona `backend/prisma/schema.prisma` y `docs/CONTEXTO_IA_EQUIPO.md` (las 10 entidades oficiales v0.3).
2. **Actualización triple sincronizada:**
   - **Contrato API (`docs/api-contract.md`):** Define ruta, método HTTP, cabeceras requeridas (`x-user-role`), payload de entrada y respuesta JSON estandarizada (`{ success: true, data }` / `{ success: false, error }`).
   - **Tipos Frontend (`frontend/src/types/`):** Genera o actualiza las interfaces TypeScript con exactamente los mismos nombres de propiedades del JSON y Prisma (`precio_base`, `estado_pedido`, `estado_pago`, `opciones_snapshot`, etc.).
   - **Servicio Prisma (`backend/src/modules/`):** Asegura que las consultas respeten los candados de negocio:
     - Cálculo de precios exclusivo con `backend/src/utils/priceCalculator.ts` (RF-02).
     - Estados independientes `estado_pedido` y `estado_pago` (RF-05, RF-07).
     - Creación de snapshots inmutables en `OrderItem` y `OrderDiscount` (RF-13).
