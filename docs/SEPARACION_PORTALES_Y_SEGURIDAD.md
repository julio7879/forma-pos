# 🛡️ Arquitectura de Separación de Portales, Seguridad y Control de Acceso (RBAC)

> **Documento Oficial de Arquitectura — Proyecto FORMA**  
> **Versión:** 1.0 (Consolidada)  
> **Fecha:** 29 de octubre de 2026  
> **Destinatarios:** Equipo de Desarrollo (Julio, Sofía, Esneider, Duvan, Yeimer, Thomas) y Jurado Evaluador  
> **Alineación:** Requisitos Funcionales RF-01 a RF-19 · Esquema Prisma de 10 Entidades v0.3 · Git Flow hacia `develop`

---

## 1. Resumen Ejecutivo y Justificación

El proyecto **FORMA** combina dos experiencias comerciales complementarias en un solo monorepo:
1. Una **Tienda Web pública** inspirada en el concepto de "Taller creativo premium", orientada a clientes finales que exploran el catálogo, personalizan productos y realizan pedidos en línea.
2. Un **Punto de Venta (POS) y Panel Administrativo privado**, diseñado para cajeros, supervisores y administradores que operan el mostrador, gestionan anticipos, controlan la preparación y auditan el negocio.

A pesar de que el modelo de datos (`backend/prisma/schema.prisma`) y la documentación fundacional (`docs/FORMA_Documentacion_Proyecto_v0.3.md`) contemplan los roles (`ADMIN`, `SUPERVISOR`, `VENDEDOR`, `PREPARADOR`) y la separación conceptual de responsabilidades entre Sofía (Store) y Esneider (POS/Admin), **el frontend actual carecía de un aislamiento estricto de rutas y seguridad perimetral**.

Este documento establece el diagnóstico formal, la arquitectura de 3 portales independientes, el modelo de control de acceso basado en roles (RBAC), el mecanismo de autenticación (Login formal y PIN rápido para cajeros) y los beneficios directos para cada integrante del equipo, garantizando la total integridad de las 10 entidades inmutables y los contratos de negocio.

---

## 2. Diagnóstico del Estado Actual del Monorepo

### 2.1 Capa de Base de Datos (Prisma ORM)
- **Archivo:** `backend/prisma/schema.prisma`
- **Hallazgo:**
  - El enum `Role` define exactamente: `ADMIN`, `SUPERVISOR`, `VENDEDOR`, `PREPARADOR`.
  - La entidad `User` almacena `id`, `nombre`, `email`, `password_hash`, `rol`, `activo`, `created_at` y sus relaciones con `Order`, `Payment`, `OrderDiscount`, `InventoryMovement` y `ActivityLog`.
  - **Fortaleza:** La base de datos ya está estructurada y migrada en Supabase Cloud para soportar RBAC estricto.
  - **Oportunidad de mejora:** No contempla un código PIN numérico corto para cajeros de mostrador en la entidad `User` (puede inferirse de una clave hash o agregarse como atributo opcional sin romper compatibilidad).

### 2.2 Capa de Backend (Express + Middlewares)
- **Archivos:**
  - `backend/src/middlewares/authRole.middleware.ts`
  - `backend/src/modules/orders/order.routes.ts`
  - `backend/src/app.ts`
- **Hallazgo:**
  - El middleware `requireRole` valida permisos evaluando la cabecera HTTP provisional `x-user-role`. Si el rol no figura en `allowedRoles`, devuelve `403 Forbidden`; si falta, devuelve `401 Unauthorized`.
  - En `order.routes.ts`, se protege la actualización de estado (`PATCH /api/orders/:id/status`) con `requireRole(['ADMIN', 'SUPERVISOR', 'VENDEDOR', 'PREPARADOR'])`.
  - En `app.ts`, CORS permite la cabecera `'x-user-role'`.
  - **Diagnóstico:** Dicha cabecera fue concebida para desarrollo ágil y testing en Fase 1, pero cualquier cliente web podría inyectar manualmente `x-user-role: ADMIN` si la API estuviera expuesta sin autenticación por token (JWT). No existen aún rutas `/api/auth/login` ni `/api/auth/me`.

### 2.3 Capa de Frontend (React + Vite)
- **Archivos:**
  - `frontend/package.json`
  - `frontend/src/App.tsx`
  - `frontend/src/components/layout/Navbar.tsx`
  - `frontend/src/modules/pos/PosQuickPreview.tsx`
- **Hallazgo:**
  - Aunque `react-router-dom: ^6.26.0` está instalado en `package.json`, `App.tsx` conmutaba pantallas mediante una variable de estado local (`activeTab`).
  - En `Navbar.tsx`, la barra de navegación pública incluía directamente la pestaña del POS (`POS & Caja`).
  - Al pulsar dicho botón, un visitante común accedía de inmediato a `PosQuickPreview.tsx`, viendo pedidos internos y acciones operativas.
  - No existía un módulo de Login, ni un `AuthContext`, ni un guardia de rutas (`AuthGuard`).

---

## 3. Vulnerabilidades y Fricciones Detectadas

| Vulnerabilidad / Fricción | Riesgo Técnico o de Negocio | Impacto en Demostración / Jurado |
| :--- | :--- | :--- |
| **Exposición del POS en Navbar público** | Clientes reales o jurados pueden abrir la caja registradora desde la tienda de regalos. | Pérdida de credibilidad profesional y violación del principio de mínimo privilegio. |
| **Ausencia de pantalla de Login** | Cualquier usuario accede al estado del POS sin identificarse con credenciales o PIN. | Imposibilidad de auditar quién creó una venta (`creado_por_id`) o registró un pago (`registrado_por_id`). |
| **Falta de rutas URL canónicas** | Toda la aplicación vivía bajo `/`, impidiendo enlaces directos o recargas de página sin perder el estado de navegación. | Dificultad para pruebas E2E automatizadas de Thomas (QA) y mala experiencia de usuario. |
| **Cabecera `x-user-role` no firmada** | Confianza ciega en una cabecera enviada por el cliente sin token criptográfico. | Vulnerabilidad de spoofing de roles si no se respalda con un token JWT o sesión validada. |

---

## 4. Arquitectura Propuesta: Las 3 Zonas de Negocio y Seguridad

Se establece una división perimetral en tres portales claramente diferenciados:

```text
                                   ┌─────────────────────────────┐
                                   │     APLICACIÓN FORMA        │
                                   └──────────────┬──────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                ▼
  ┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
  │      ZONA 1: TIENDA         │  │       ZONA 2: POS           │  │       ZONA 3: ADMIN         │
  │    (Portal Público Web)     │  │   (Terminal Caja / Taller)  │  │  (Panel de Control Gerencial)│
  ├─────────────────────────────┤  ├─────────────────────────────┤  ├─────────────────────────────┤
  │ Acceso: Público (Anónimo)   │  │ Acceso: Privado (Login/PIN) │  │ Acceso: Privado (Email/Pwd) │
  │ Layout: StoreLayout         │  │ Layout: PosLayout (Kiosco)  │  │ Layout: AdminLayout (Sidebar)│
  │ Rutas:                      │  │ Roles: VENDEDOR, SUPERVISOR,│  │ Roles: SUPERVISOR, ADMIN    │
  │  - /tienda (Catálogo)       │  │        PREPARADOR           │  │ Rutas:                      │
  │  - /tienda/producto/:id     │  │ Rutas:                      │  │  - /admin/login             │
  │  - /tienda/checkout         │  │  - /pos/login (PIN rápido)  │  │  - /admin/dashboard (KPIs)  │
  │  - /tienda/seguimiento      │  │  - /pos (Caja & Mostrador)  │  │  - /admin/pedidos           │
  │                             │  │  - /pos/taller (Kanban)     │  │  - /admin/catalogo          │
  │                             │  │                             │  │  - /admin/usuarios (Solo Ad)│
  └─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘
```

### 4.1 Zona 1: Tienda Web Pública (`/tienda`)
- **Público objetivo:** Clientes finales.
- **Acceso:** Totalmente abierto, sin inicio de sesión obligatorio.
- **Aislamiento de seguridad:** El Navbar y Footer de la tienda **jamás** contienen enlaces, botones ni menciones hacia el POS o el Panel Admin. Solo un atajo muy discreto o URL directa permite ir al acceso de staff.

### 4.2 Zona 2: Terminal POS / Caja de Taller (`/pos`)
- **Público objetivo:** Cajeros (`VENDEDOR`), Preparadores de Taller (`PREPARADOR`) y Supervisores.
- **Acceso:** Privado, protegido por `AuthGuard(['VENDEDOR', 'SUPERVISOR', 'ADMIN', 'PREPARADOR'])`.
- **Mecanismo de Entrada:** Pantalla de Login / PIN Pad para selección rápida de cajero y turno.

### 4.3 Zona 3: Panel de Control Administrativo (`/admin`)
- **Público objetivo:** Administradores (`ADMIN`) y Supervisores (`SUPERVISOR`).
- **Acceso:** Privado estricto, protegido por `AuthGuard(['ADMIN', 'SUPERVISOR'])`.
- **Mecanismo de Entrada:** Formulario formal de Email y Contraseña.

---

## 5. Beneficios para el Equipo de Trabajo

- **Sofía (Frontend Store):** Se concentra al 100% en la belleza editorial del catálogo, configurador de productos y checkout sin elementos de caja registradora.
- **Esneider (Frontend POS & Admin):** Desarrolla un terminal de cobro táctil con teclado numérico, cálculo de cambio y tablero Kanban de taller con layout optimizado.
- **Thomas (QA & Testing):** Puede validar formalmente la matriz de pruebas con URLs canónicas y verificar los candados de seguridad perimetral (RBAC).
- **Duvan, Yeimer y Julio (Backend & BD):** Toda venta y pago se vincula con precisión al `User` responsable autenticado (`creado_por_id`, `registrado_por_id`).


---

## 6. Sincronización del Ciclo de Vida de Pedidos en UI (Stepper de Seguimiento)

Para evitar discrepancias entre el frontend y el backend, el componente de seguimiento público (`OrderTracking.tsx`) debe modelar con exactitud la máquina de estados unidireccional implementada en `backend/src/modules/orders/order.service.ts`:

```text
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌───────────────┐
│ 1. RECIBIDO  │ ──> │ 2. EN_PREPARACION│ ──> │   3. LISTO   │ ──> │ 4. ENTREGADO  │
└──────────────┘     └──────────────────┘     └──────────────┘     └───────────────┘
       │                      │                      │
       └──────────────────────┴──────────────────────┴───> [ CANCELADO ]
```

### Reglas de Negocio Vinculadas al Stepper:
1. **Ausencia del estado `CONFIRMADO` en BD:**
   - La confirmación financiera y de producción **no es un estado de pedido**. Está resuelta de forma independiente por el atributo `estado_pago` (`PENDIENTE`, `ANTICIPO_PARCIAL`, `PAGADO`).
   - Al registrar el anticipo del 50% o validar el diseño, el pedido transiciona directamente de `RECIBIDO` a `EN_PREPARACION`.
2. **Candado de Entrega Final:**
   - Un pedido en estado `LISTO` solo puede transicionar a `ENTREGADO` si `estado_pago === 'PAGADO'` (saldo pendiente igual a $0).
3. **Representación Visual en Tienda Web:**
   - El stepper del cliente en `/tienda/seguimiento` muestra exclusivamente estos 4 pasos progresivos. Si un pedido es cancelado, se muestra una alerta visual con el motivo de cancelación sin alterar el histórico.
