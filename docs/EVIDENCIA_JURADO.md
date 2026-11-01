# 📋 Bitácora Oficial de Evidencia para el Jurado — Proyecto FORMA

> **Proyecto:** FORMA — POS adaptable y tienda web para negocios de productos personalizados  
> **Repositorio:** `https://github.com/julio7879/forma-pos`  
> **Flujo de Trabajo:** Scrumban + GitHub Flow (`feature/*` ➔ `develop` ➔ `main`)  
> **Equipo:** Julio (Líder/Backend) · Sofía (Diseño/Frontend Store) · Esneider (Diseño/Frontend POS & Admin) · Duvan (Base de Datos/Prisma) · Yeimer (Backend de Datos) · Thomas (QA/Tester)

---

## 🏗️ Hito 1: Arquitectura Monorepo, Gobernanza Git y Cimientos Técnicos
- **Fecha:** 27 - 28 de octubre de 2026
- **Estado:** ✅ Completado y Verificado en `develop`
- **Issues cerradas:** [#1](https://github.com/julio7879/forma-pos/issues/1), [#6](https://github.com/julio7879/forma-pos/issues/6)
- **Pull Requests integrados:** [PR #9](https://github.com/julio7879/forma-pos/pull/9) (`commit 8802154`)

### 1. Decisiones de Arquitectura Consolidadas (v0.3)
1. **Stack Tecnológico:**
   - **Frontend:** React 18 + Vite 5 + Tailwind CSS 3.4 + TypeScript.
   - **Backend:** Node.js + Express 4 + TypeScript.
   - **Base de Datos y ORM:** PostgreSQL + Prisma ORM (10 entidades auditadas).
2. **Candados de Negocio Implementados:**
   - **RF-02 (Fuente única de verdad en precios):** Utilidad `backend/src/utils/priceCalculator.ts` (`(base + extras) * cantidad - descuento`).
   - **RF-12 (Seguridad de roles en servidor):** Middleware `backend/src/middlewares/authRole.middleware.ts` validando `ADMIN`, `SUPERVISOR`, `VENDEDOR` y `PREPARADOR` con respuestas `401` y `403`.
   - **Estandarización de Errores:** Middleware `backend/src/middlewares/error.middleware.ts` asegurando formato `{ success: false, error: { code, message } }`.

### 2. Evidencia de Verificación Técnica (Hito 1)
```json
{
  "healthStatus": 200,
  "corsHeader": "http://localhost:5173",
  "healthBody": {
    "success": true,
    "data": {
      "status": "ok",
      "service": "forma-backend",
      "timestamp": "2026-10-28T01:28:48.707Z"
    }
  }
}
```

---

## 🛡️ Hito 1.5: Gobernanza Multi-IA, Esquema de 10 Entidades y Blindaje de Contratos
- **Fecha:** 28 de octubre de 2026
- **Estado:** ✅ Completado y Verificado en `develop`
- **Issues cerradas:** [#12](https://github.com/julio7879/forma-pos/issues/12)
- **Pull Requests integrados:** [PR #13](https://github.com/julio7879/forma-pos/pull/13) (`commit c489152`)

### 1. Aportes Técnicos e Integración
1. **Blindaje de Contexto Multi-IA:**
   - Creación de `docs/CONTEXTO_IA_EQUIPO.md` y `CLAUDE.md` para evitar alucinaciones en ChatGPT, Claude y Gemini utilizados por el equipo.
   - Definición inmutable de las 10 entidades: `User`, `Product`, `ProductOption`, `Order`, `OrderItem`, `Payment`, `Promotion`, `OrderDiscount`, `InventoryMovement`, `ActivityLog`.
   - Adopción de la plantilla oficial `.github/pull_request_template.md` con checklist de candados obligatorios de negocio (RF-02, RF-12, RF-13).
2. **Suite de Habilidades Operativas (`.agents/skills/`):**
   - `forma-github-workflow`: Gobernanza de ramas y prohibición de merges directos sin autorización del líder.
   - `forma-gestor-evidencia`: Estandarización de issues y registro de trazabilidad para el jurado.
   - `forma-auditor-pr`: Auditoría sistemática de PRs contra las 10 entidades y lógica de negocio.
   - `forma-sincronizador-api`: Alineación 1:1 entre Prisma, TypeScript y contratos JSON.
   - `forma-panel-expertos-avanzado`: Evaluación multicriterio de decisiones bajo 5 perspectivas clave.
   - `forma-evaluador-progreso`: Medición objetiva frente a RF-01 a RF-19 y fecha límite del 31 de octubre.
   - `forma-prompts-equipo`: Generador de prompts acotados para los integrantes.
   - `forma-puente-supabase-mocks`: Conectividad Supabase + Prisma y mocks paralelos para frontend.

---

## ☁️ Hito 2: Aprovisionamiento Cloud (Supabase) y Migración de 10 Entidades
- **Fecha:** 28 de octubre de 2026
- **Estado:** ✅ Completado y Migrado en Supabase Cloud (PR #14 abierto hacia `develop`)
- **Responsables:** Duvan Covilla (Base de Datos) y Julio Vega (Líder / Infraestructura)
- **Pull Request:** [PR #14](https://github.com/julio7879/forma-pos/pull/14) (`commit 5eaf321`) con co-autoría Git (`Co-authored-by: Ciel Covilla <duvancovilla292@gmail.com>`).
- **Issues vinculadas:** [#4](https://github.com/julio7879/forma-pos/issues/4)

### 1. Infraestructura Cloud Aprovisionada
- **Proveedor:** Supabase Cloud (PostgreSQL 15+).
- **Región:** `aws-1-us-west-2` (Project ID: `wktrhtjrjodxomkuisxu`).
- **Arquitectura de Conexión Dual:**
  - `DATABASE_URL`: Transaction Mode Pooler (puerto 6543 con PgBouncer) para alta concurrencia de la API.
  - `DIRECT_URL`: Session Mode Pooler (puerto 5432) para ejecución de migraciones DDL con Prisma Migrate.
- **Configuración en el Monorepo:**
  - Actualización de `backend/prisma/schema.prisma` con soporte nativo para `directUrl = env("DIRECT_URL")`.
  - Actualización de `backend/.env.example` y creación de `backend/.env` local seguro (ignorado en Git).

### 2. Corrección Técnica y Colaboración en el Issue #4
- **Resolución de Bloqueo de Red (P1001):** Las redes de campus bloquean por firewall el puerto saliente 5432 de PostgreSQL. Se corrigió y ejecutó la migración desde la estación del líder con enlace directo.
- **Alineación de Dominio y Contrato:** Se re-sincronizó la rama de Duvan sobre el `develop` más reciente para evitar la eliminación accidental de skills/documentación y se preservaron los nombres oficiales de campos en español (`precio_base`, `cliente_contacto`, `valores_recargos`).
- **Trazabilidad de Co-autoría:** El commit final preserva el reconocimiento formal de Duvan ante el jurado.

### 3. Evidencia de Ejecución de la Migración Oficial
```text
Applying migration `20261028215200_init_10_entities`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20261028215200_init_10_entities/
    └─ migration.sql

Your database is now in sync with your schema.

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client in 286ms
```

---

## 🎨 Hito 2.5: Desbloqueo y Acompañamiento Técnico al Frontend
- **Fecha:** 28 de octubre de 2026
- **Estado:** ✅ Pautas publicadas / Desarrollo en marcha

1. **Sofía — [Issue #8](https://github.com/julio7879/forma-pos/issues/8#issuecomment-6476931297) y [#2](https://github.com/julio7879/forma-pos/issues/2#issuecomment-6476936095) (Guía de estilo y tokens de diseño):**
   - Unificación de tareas en una sola rama de trabajo (`feature/8-guia-estilo-tokens`).
   - Propuesta de referencia para `frontend/tailwind.config.js` y `docs/design-tokens.md`, respetando la total autonomía creativa de Sofía para definir la paleta final del "Taller creativo premium".
2. **Esneider — [Issue #3](https://github.com/julio7879/forma-pos/issues/3#issuecomment-6476942531) (Componentes UI comunes):**
   - Estructuración de los 4 componentes base (`Button.tsx`, `Input.tsx`, `Badge.tsx`, `Modal.tsx`) con props tipadas, soporte de estados (`hover`, `focus`, `disabled`, `loading`) y exportación barril en `frontend/src/components/ui/index.ts`.

---

## 🔍 Hito 3: Auditorías de Calidad de Código y PRs en Revisión
- **Fecha:** 28 de octubre de 2026
- **Estado:** 🟡 En Espera de Ajustes por los Autores

| PR / Issue | Autor | Módulo | Diagnóstico de Auditoría (`forma-auditor-pr`) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **[PR #30](https://github.com/julio7879/forma-pos/pull/30)** / [#27](https://github.com/julio7879/forma-pos/issues/27) | Julio | Backend Estados & Pagos | Máquina de estados unidireccional (RF-05, RF-12), anticipos reactivos y cambio en efectivo (RF-06, RF-07). 12/12 pruebas pasadas. | 🟢 Listo para Merge |
| **[PR #29](https://github.com/julio7879/forma-pos/pull/29)** / [#23](https://github.com/julio7879/forma-pos/issues/23) | Duvan | Backend Promociones | Base actualizada a `develop`. 1 commit limpio (+203/-1). Fusionado en `develop`. | 🟢 Fusionado en `develop` |
| **[PR #14](https://github.com/julio7879/forma-pos/pull/14)** / [#4](https://github.com/julio7879/forma-pos/issues/4) | Duvan / Julio | Base de Datos (Prisma) | Migración inicial oficial de 10 entidades aplicada en Supabase. Co-autoría asignada. Listo para merge del líder. | 🟢 Listo para Merge |
| **[PR #28](https://github.com/julio7879/forma-pos/pull/28)** / [#2](https://github.com/julio7879/forma-pos/issues/2), [#8](https://github.com/julio7879/forma-pos/issues/8) | Sofía | Frontend Tokens & Doc | Tokens oficiales y guía de diseño viva configurados en `tailwind.config.js` y `docs/design-tokens.md`. Fusionado por el líder. | 🟢 Fusionado en `develop` |
| **[PR #25](https://github.com/julio7879/forma-pos/pull/25)** / [#3](https://github.com/julio7879/forma-pos/issues/3) | Esneider | Frontend UI / Tailwind | Componentes base (`Button`, `Input`, `Badge`, `Modal`) tipados. `main.tsx` y `index.css` integrados. Esperando `postcss.config.js`. | ⏳ En Ajustes por Esneider |
| **[PR #10](https://github.com/julio7879/forma-pos/pull/10)** / [#7](https://github.com/julio7879/forma-pos/issues/7) | Thomas | QA & Testing | Feedback publicado en `#issuecomment-6473706797`. Se acordó la Opción B: casos de prueba teóricos completos de RF-01 a RF-19 y títulos de checklist sin bloquear la Fase 1. | ⏳ Pendiente nuevo commit de Thomas |
| **[PR #11](https://github.com/julio7879/forma-pos/pull/11)** / [#5](https://github.com/julio7879/forma-pos/issues/5) | Yeimer | Contrato de API | Feedback publicado en `#issuecomment-6473706180`. Se corrigió alucinación de catálogo (hamburguesas) para alinearlo al taller de productos personalizados y 10 entidades de Prisma. | ⏳ Pendiente nuevo commit de Yeimer |

---

## 📦 Hito 4: Módulo Central de Pedidos, Cálculo Estricto de Precios y Tracking
- **Fecha:** 29 de octubre de 2026
- **Estado:** ✅ Completado y Fusionado en `develop`
- **Responsable:** Julio Vega (Líder / Backend)
- **Issue cerrada:** [#18](https://github.com/julio7879/forma-pos/issues/18)
- **Pull Request integrado:** [PR #24](https://github.com/julio7879/forma-pos/pull/24) (`commit c768a93`)

### 1. Aportes Técnicos e Integración
1. **Cumplimiento de RF-02 (Cálculo estricto en backend):**
   - El backend ignora cualquier subtotal o total enviado por el frontend.
   - Aplica `priceCalculator.ts` recalculando base, recargos de opciones personalizadas y descuentos validados contra la base de datos dentro de una transacción interactiva de Prisma (`$transaction`).
2. **Cumplimiento de RF-04, RF-07 y RF-08 (Gestión de Pedidos y Tracking):**
   - Creación de pedidos para Web (`WEB`) y POS presencial (`POS`).
   - Asignación de estado inicial estricto (`RECIBIDO` o `EN_PREPARACION` si es POS pagado).
   - Generación de referencia única criptográfica de tracking de 8 caracteres (`FORMA-XXXXXX`).
   - Endpoint público de seguimiento (`GET /api/orders/tracking/:referencia`) con validación de teléfono o correo por seguridad.
3. **Registro de Trazabilidad (RF-13):**
   - Creación automática de `ActivityLog` en cada cambio o creación de pedido.

---

## 🎨 Hito 5: Sistema de Diseño Visual "Taller Creativo Premium" y Tokens Oficiales
- **Fecha:** 29 de octubre de 2026
- **Estado:** ✅ Completado y Fusionado en `develop`
- **Responsable:** Sofía (Diseño / Frontend Store)
- **Issues cerradas:** [#2](https://github.com/julio7879/forma-pos/issues/2), [#8](https://github.com/julio7879/forma-pos/issues/8)
- **Pull Request integrado:** [PR #28](https://github.com/julio7879/forma-pos/pull/28) (`commit 2c9c89d`)

### 1. Aportes Técnicos e Integración
1. **Paleta Semántica Oficial (`frontend/tailwind.config.js`):**
   - `ink`: `#171717` (Fondos y texto oscuro base).
   - `accent`: `#D19650` (Dorado de acento, CTAs y anillo de foco).
   - `danger`: `#661521` (Vinotinto para errores y acciones destructivas).
   - `surface`: `#734F46` (Café para tarjetas y paneles secundarios).
   - `cream`: `#E7DED2` (Crema claro para textos y fondos de botones).
   - Estados semánticos: `success` (`#6B7A4F`), `warning` (`#D19650`), `info` (`#734F46`).
2. **Tipografía y Bordes:**
   - Tipografía dual: `serif` (`Playfair Display`) para encabezados y `sans` (`Inter`) para cuerpo y UI.
   - Escala de bordes redondeados (`rounded-sm`: 4px, `rounded`: 8px, `rounded-md`: 12px, `rounded-lg`: 16px).
3. **Documentación Viva de Sistema de Diseño:**
   - Formalización en [`docs/design-tokens.md`](file:///c:/Users/Usuario/Desktop/forma-pos/docs/design-tokens.md) de las reglas de diseño para Tienda Web, POS y Panel Administrativo, alineadas 1:1 con los componentes UI comunes de Esneider.

---

## 💳 Hito 6: Máquina de Estados Operativa y Módulo de Pagos / Anticipos
- **Fecha:** 29 de octubre de 2026
- **Estado:** 🟢 PR #30 abierto hacia `develop` (Evaluado unánime 5/5 por el Comité de Expertos)
- **Responsable:** Julio Vega (Líder / Backend)
- **Issue vinculada:** [#27](https://github.com/julio7879/forma-pos/issues/27)
- **Pull Request:** [PR #30](https://github.com/julio7879/forma-pos/pull/30)

### 1. Aportes Técnicos e Integración
1. **Máquina de Estados Unidireccional (RF-05, RF-12):**
   - Transiciones legales: `RECIBIDO` ➔ `EN_PREPARACION` ➔ `LISTO` ➔ `ENTREGADO`.
   - Bloqueo estricto de estados terminales (`ENTREGADO` y `CANCELADO` inmutables).
   - Candado financiero: Prohibido entregar pedidos con saldo pendiente (`400 ORDER_PENDING_PAYMENT`).
   - Control de roles en servidor: `ADMIN`, `SUPERVISOR`, `PREPARADOR`, `VENDEDOR`.
2. **Módulo de Pagos y Anticipos (RF-06, RF-07):**
   - `POST /api/payments` y `GET /api/payments/order/:orderId`.
   - Transacciones atómicas con Prisma `$transaction`, recálculo reactivo de `total_pagado`, `saldo_pendiente` y `estado_pago` (`PENDIENTE`, `ANTICIPO_PARCIAL`, `PAGADO`).
   - Cálculo automático de cambio devuelto en efectivo.
3. **Auditoría Inmutable (RF-13):**
   - Eventos `CAMBIO_ESTADO` y `REGISTRO_PAGO` en `ActivityLog` con protección de claves foráneas.
4. **Criterios de Aceptación Documentados:**
   - Incorporación formal de criterios CA-01 a CA-13 en `docs/FORMA_Documentacion_Proyecto_v0.3.md`.

---

## 🛍️ Hito 7: Frontend Tienda Web Pública (Catálogo, Configurador y Tracking)
- **Fecha:** 1 de noviembre de 2026
- **Estado:** 🟣 PR #39 integrado y fusionado en `develop` (commit `c39866f`)
- **Responsable:** Esneider Nava (Diseño + Frontend Store)
- **Issue vinculada:** [#19](https://github.com/julio7879/forma-pos/issues/19)
- **Pull Request:** [PR #39](https://github.com/julio7879/forma-pos/pull/39)

### 1. Aportes Técnicos e Integración
1. **Catálogo de Tienda (`StoreCatalog.tsx` — RF-01):**
   - Grid responsive con tarjetas de producto artesanales y badge de categoría.
   - Consumo del servicio oficial `productService.getProducts()` de `apiClient.ts`.
2. **Configurador Visual de Producto (`ProductConfigurator.tsx` — RF-02):**
   - Selección interactiva de opciones y variantes con recargos dinámicos en tiempo real.
   - Candado de Negocio RF-02: Totales en frontend presentados como estimaciones previas al cálculo estricto en backend.
3. **Carrito y Checkout Conectado (`StoreCart.tsx`, `StoreCheckout.tsx` — RF-03):**
   - Conexión con `orderService.createOrder` enviando `CreateOrderInput` con `origen: 'WEB'`.
   - Limpieza automática de carrito y retroalimentación de pedido exitoso.
4. **Seguimiento de Pedidos (`OrderTracking.tsx` — RF-08):**
   - Stepper visual unidireccional de 4 estados: `RECIBIDO` ➔ `EN_PREPARACION` ➔ `LISTO` ➔ `ENTREGADO`.
   - Búsqueda por referencia (ej. `FORMA-1001`) con badge financiero independiente (`estado_pago`).

---

## 📟 Hito 8: Frontend Terminal de Punto de Venta (POS) y Enrutador Multiruta
- **Fecha:** 1 de noviembre de 2026
- **Estado:** 🟣 PR #38 integrado y fusionado en `develop` (commit `ba379ef`)
- **Responsable:** Esneider Nava (Frontend POS) y Julio Vega (Líder / Integración)
- **Issue vinculada:** [#20](https://github.com/julio7879/forma-pos/issues/20)
- **Pull Request:** [PR #38](https://github.com/julio7879/forma-pos/pull/38)

### 1. Aportes Técnicos e Integración
1. **Terminal de Venta Rápida (`PosRegister.tsx` — RF-03, RF-07):**
   - Botonera táctil optimizada para mostrador con buscador predictivo y carga desde `productService`.
   - Personalización ágil mediante modal `PosConfig.tsx` con opciones y recargos oficiales.
2. **Carrito de Mostrador y Modal de Cobro (`PosCart.tsx`, `PaymentModal.tsx` — RF-06, RF-07):**
   - Soporte de cobro total o anticipo parcial (50%) con cálculo automático de saldo pendiente.
   - Métodos de pago oficiales: `EFECTIVO`, `TRANSFERENCIA` y `DEMO`.
   - Conexión al backend vía `orderService.createOrder` (`origen: 'POS'`, desglose en `pago_inicial`).
3. **Enrutador Maestro y Separación de Portales (`App.tsx` — RF-12):**
   - Desacople limpio de portales: `StoreApp` (público) y `PosApp` (privado cajero).
   - Detección canónica de rutas (`/tienda`, `/pos`, `/admin`) y selector discreto para demostración de jurado.
4. **Compilación y Control de Calidad:**
   - 100% libre de errores TypeScript (`tsc -b && vite build`) en frontend y backend.

---

## 📌 Estado Actual del Tablero Kanban (Fase 1 / 31 de Octubre)
- **Completadas (Done):**
  - #1 Monorepo scaffolding
  - #2 Definir tokens visuales y tema Taller creativo premium en Tailwind (**[PR #28](https://github.com/julio7879/forma-pos/pull/28)**)
  - #3 Componentes UI comunes del sistema de diseño (**[PR #25](https://github.com/julio7879/forma-pos/pull/25)**)
  - #4 Esquema Prisma de 10 entidades y migración Supabase Cloud (**[PR #14](https://github.com/julio7879/forma-pos/pull/14)**)
  - #5 Contrato oficial de API para catálogo y pedidos (**[PR #21](https://github.com/julio7879/forma-pos/pull/21)**)
  - #6 Express base server, CORS y middlewares de error/roles
  - #7 Matriz de casos de prueba inicial de QA (**[PR #10](https://github.com/julio7879/forma-pos/pull/10)**)
  - #8 Guía de estilo completa y sistema visual Taller creativo premium (**[PR #28](https://github.com/julio7879/forma-pos/pull/28)**)
  - #12 Contexto Multi-IA, Skills y gobernanza de equipo (**[PR #13](https://github.com/julio7879/forma-pos/pull/13)**)
  - #16 Seed oficial en Supabase con productos personalizados (**[PR #22](https://github.com/julio7879/forma-pos/pull/22)**)
  - #18 Módulo de pedidos, cálculo estricto de precios y tracking (**[PR #24](https://github.com/julio7879/forma-pos/pull/24)**)
  - #23 Motor de promociones y validación de cupones (**[PR #29](https://github.com/julio7879/forma-pos/pull/29)**)
  - #27 Máquina de estados de pedidos y registro de anticipos/pagos (**[PR #30](https://github.com/julio7879/forma-pos/pull/30)**)
  - Release v0.1: Cimientos, DB, Pedidos y Tracking fusionados en `main` (**[PR #26](https://github.com/julio7879/forma-pos/pull/26)**)
  - #15 Prototipo interactivo UI/UX y flujos en Lovable (**[PR #32](https://github.com/julio7879/forma-pos/pull/32)**)
  - #17 Endpoints de catálogo de productos y opciones (**[PR #33](https://github.com/julio7879/forma-pos/pull/33)**)
  - #19 Maquetar vistas de Tienda Web: catálogo y configurador (**[PR #39](https://github.com/julio7879/forma-pos/pull/39)**)
  - #20 Maquetar vistas de POS: terminal de venta rápida y cobro (**[PR #38](https://github.com/julio7879/forma-pos/pull/38)**)
  - #31 Tipos TypeScript compartidos, cliente HTTP y datos mock frontend (**[PR #37](https://github.com/julio7879/forma-pos/pull/37)**)
- **En Revisión / Listas para Merge (In Review):**
  - #34 Implementar endpoint de Dashboard Operativo y KPIs GET /api/dashboard/stats (**[PR #40](https://github.com/julio7879/forma-pos/pull/40)** — Yeimer)
- **En Progreso (In Progress):**
  - #35 Ejecutar y documentar la suite de pruebas funcionales de endpoints en docs/qa-test-matrix.md (**Thomas**)
  - #36 Auditar flujos de usuario en prototipo interactivo y checklist demo jurado (**Thomas**)
