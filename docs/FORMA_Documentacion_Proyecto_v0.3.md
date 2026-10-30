**FORMA — Documentación Inicial y Arquitectura Definitiva**

*Tu idea toma forma. · POS adaptable y tienda web conectados para negocios de productos personalizados.*

Versión: 0.3 (Stack, Modelo Prisma de 10 Entidades y Estructura Monorepo Consolidados)
Fecha: 27 de octubre de 2026 · Líder del equipo: Julio
Equipo: Julio (Líder/Backend) · Sofía (Diseño/Frontend Store) · Esneider (Diseño/Frontend POS & Admin) · Duvan (Datos/Prisma) · Yeimer (Backend de Datos) · Thomas (QA/Tester)

> ### **PROPÓSITO DE LA VERSIÓN 0.3**
> Esta versión actualiza el documento v0.2 incorporando las decisiones técnicas definitivas (React + Vite + Tailwind, Node + Express + TypeScript, PostgreSQL + Prisma ORM), la auditoría completa de las 10 entidades de base de datos y la estructura definitiva de carpetas del repositorio.

## 1. Contexto y visión

FORMA es una plataforma comercial que conecta una tienda web pública con un punto de venta (POS) y un panel de administración. Su primer enfoque son los negocios de productos personalizados: regalos, camisetas, tazas, artículos impresos, papelería creativa, artesanías y productos por encargo.

La solución tiene una base adaptable a otros comercios mediante productos, variantes, opciones y reglas configurables. Sin embargo, el alcance inicial del MVP se concentra en el flujo de personalización y gestión de pedidos de principio a fin.

- **Problema:** Los negocios pequeños suelen recibir pedidos por redes sociales, chats y atención presencial; dispersan la información, cotizan manualmente, pierden detalles de personalización, confunden anticipos con saldos pendientes y tienen poca visibilidad del estado de cada encargo.
- **Propuesta de valor:** FORMA centraliza el catálogo, la personalización visual, las ventas presenciales, los pedidos web y el seguimiento de cada encargo en un solo sistema conectado.
- **Visión de producto:** Combinar la estética de una marca creativa con la rapidez operativa de un POS profesional. La web invita a explorar y personalizar; el POS permite atender con pocos pasos, errores mínimos y estados claros.
- **Pitch corto:** “FORMA es una plataforma de venta para negocios de productos personalizados que conecta una tienda web visual e interactiva con un POS, permitiendo configurar productos, recibir pedidos y administrar su preparación, entrega y pagos desde un solo lugar.”

## 2. Usuarios, roles y permisos del sistema

FORMA maneja roles de negocio independientes de los cargos del equipo de desarrollo. Los permisos se comprueban obligatoriamente en el backend mediante middlewares; ocultar botones en la interfaz no protege una operación.

| **Rol** | **Permisos principales** | **Restricciones principales** |
| --- | --- | --- |
| **Administrador (`ADMIN`)** | Catálogo, precios, opciones, pedidos, ventas, inventario, dashboard, promociones, usuarios, reportes e historial de actividad. | No debe alterar silenciosamente registros históricos; las acciones sensibles dejan rastro en ActivityLog. |
| **Supervisor (`SUPERVISOR`)** | Consultar dashboard operativo, revisar pedidos/ventas, gestionar pedidos y autorizar descuentos manuales sobre el límite. | No administra usuarios ni reglas globales salvo permiso explícito. |
| **Vendedor / cajero (`VENDEDOR`)** | Crear ventas POS y pedidos, consultar productos, registrar pagos/anticipos de demo y aplicar promociones válidas o descuentos dentro del límite. | No cambia roles, reglas globales, costos ni borra ventas. |
| **Preparador (`PREPARADOR`)** | Ver pedidos asignados, especificaciones de personalización, referencias y fecha prometida; actualizar estados de preparación. | No cambia precios ni registra pagos; no ve reportes financieros detallados. |
| **Cliente (Público)** | Ver catálogo, personalizar productos, crear pedidos web y consultar sus propios pedidos con código de referencia + dato de contacto. | No puede consultar pedidos ajenos ni entrar al panel interno. |

## 3. Alcance del MVP y flujo de demostración

**Incluido en el MVP demostrable**

- **Web pública de marca:** Portada, catálogo, detalle del producto y experiencia adaptable a móvil.
- **Configurador visual limitado:** Opciones predefinidas (color, tamaño, texto, acabado) con impacto visual y recargo calculado.
- **Creación de pedidos web:** Datos de contacto, personalización, cantidad, precio calculado y fecha deseada.
- **POS interno:** Búsqueda rápida, creación de venta/pedido presencial, resumen del total y registro de método de pago de demo.
- **Panel de pedidos y estados separados:** Estado del pedido (RECIBIDO → CONFIRMADO → EN_PREPARACION → LISTO → ENTREGADO / CANCELADO) separado del Estado del pago (PENDIENTE → ANTICIPO_REGISTRADO → PAGADO).
- **Seguimiento por referencia validado:** Consulta pública del cliente usando su referencia única (ej. FORMA-1042) más su teléfono o email de contacto.
- **Catálogo e inventario básico:** Alta/edición de productos, control de stock_actual y stock_minimo para alertas.
- **Dashboard administrativo:** KPIs reales desde datos persistidos (ventas del periodo, pedidos por estado, pendientes de acción, stock bajo, descuentos aplicados y actividad reciente).
- **Descuentos y promociones:** Descuentos porcentuales o fijos, validación de códigos por vigencia y mínimo de compra, regla de no acumulación e instantánea en el pedido.

**Fuera del MVP (salvo que sobre tiempo)**

Facturación electrónica DIAN, pasarela de pago real, contabilidad/nómina, multiempresa avanzada, fórmulas industriales de materias primas, integraciones con WhatsApp/transportadoras, cupones acumulables complejos e IA generativa o 3D complejo.

## 4. Requisitos funcionales y no funcionales

| **ID / Prioridad** | **Requisito verificable** |
| --- | --- |
| **RF-01 (Must)** | Crear, consultar y editar productos con nombre, imagen, descripción, categoría, precio base, stock_actual, stock_minimo, estado y opciones permitidas. |
| **RF-02 (Must)** | Calcular el precio en el backend según cantidad, opciones con recargo y descuentos válidos. |
| **RF-03 (Must)** | Crear un pedido desde la web (origen WEB) y almacenarlo una sola vez. |
| **RF-04 (Must)** | Listar, filtrar y abrir pedidos desde el panel interno de acuerdo con el rol. |
| **RF-05 (Must)** | Crear una venta o pedido desde el POS (origen POS) para atención presencial. |
| **RF-06 (Must)** | Actualizar el estado del pedido respetando transiciones permitidas y guardar el cambio en ActivityLog. |
| **RF-07 (Must)** | Registrar pago o anticipo de demostración y actualizar estado_pago y total_pagado sin confundirlo con el estado del pedido. |
| **RF-08 (Must)** | Mostrar al cliente la referencia única y el estado vigente validando su contacto. |
| **RF-09 (Must)** | Validar campos obligatorios y evitar cantidades, precios, descuentos o estados inválidos. |
| **RF-10 (Must)** | Dashboard con ventas del periodo, pedidos por estado, pendientes de acción, stock bajo y actividad reciente. |
| **RF-11 (Must)** | Aplicar descuento porcentual o fijo y validar promociones por código/vigencia con regla de no acumulación. |
| **RF-12 (Must)** | Aplicar permisos en backend según rol para proteger rutas administrativas y operativas. |
| **RF-13 (Must)** | Conservar en OrderItem y OrderDiscount una instantánea inmutable de precios, opciones y descuentos aplicados. |
| **RF-14 a RF-19 (Should)** | Ajuste manual de inventario, filtros avanzados de pedidos, actualización periódica/tiempo real, descuentos manuales con razón/límite, filtros de periodo en dashboard y auditoría en ActivityLog. |
| **RF-20 a RF-23 (Could)** | Carga de imagen de referencia, previsualización avanzada, comprobante imprimible y reglas de promoción por producto específico. |

### 4.1 Criterios de Aceptación Detallados (Requisitos Must-Have RF-01 a RF-13)

Para eliminar cualquier ambigüedad técnica y blindar la entrega frente a los criterios del jurado, se establecen los siguientes criterios formales de aceptación:

* **RF-01 (Gestión de Productos):**
  - **CA-01.1:** El endpoint `GET /api/products` retorna productos activos con sus opciones de personalización tipadas (`SELECT`, `TEXT`, `COLOR`) y valores de recargo en JSON.
  - **CA-01.2:** Cada producto cuenta con `stock_actual` y umbral `stock_minimo` persistidos en PostgreSQL.
* **RF-02 (Cálculo Inmutable de Precios):**
  - **CA-02.1:** El backend ignora cualquier cálculo de total proveniente del cliente y ejecuta `priceCalculator.ts` como única fuente de verdad: `(precio_base + SUM(recargos)) * cantidad - descuento`.
  - **CA-02.2:** Si un recargo u opción enviada no coincide con la base de datos, la orden se rechaza con código `400 Bad Request`.
* **RF-03 / RF-05 (Creación de Pedidos Web y POS):**
  - **CA-03.1:** Un pedido `WEB` nace en estado `RECIBIDO` y estado de pago `PENDIENTE`.
  - **CA-05.1:** Un pedido o venta presencial `POS` permite registrar pago inicial inmediato (anticipo o total) y cambia a `EN_PREPARACION` si ha sido abonado.
* **RF-04 (Consulta y Filtrado Administrativo):**
  - **CA-04.1:** Los pedidos pueden filtrarse concurrentemente por `estado_pedido`, `estado_pago` y `origen`.
* **RF-06 (Máquina de Estados Operativa del Pedido):**
  - **CA-06.1:** Solo se admiten transiciones legales unidireccionales: `RECIBIDO` ➔ `EN_PREPARACION` ➔ `LISTO` ➔ `ENTREGADO`.
  - **CA-06.2:** La cancelación (`CANCELADO`) solo puede ejecutarse desde `RECIBIDO`, `EN_PREPARACION` o `LISTO`, exige rol `ADMIN` o `SUPERVISOR` y campo `motivo` obligatorio.
  - **CA-06.3:** `ENTREGADO` y `CANCELADO` son estados terminales inmutables.
  - **CA-06.4:** Un pedido con saldo pendiente no puede marcarse como `ENTREGADO` bajo ninguna circunstancia.
* **RF-07 (Gestión y Separación de Pagos / Anticipos):**
  - **CA-07.1:** `estado_pago` (`PENDIENTE`, `ANTICIPO_PARCIAL`, `PAGADO`) evoluciona de forma reactiva según la suma acumulada en `Payment.monto`.
  - **CA-07.2:** Si el pago es en efectivo con valor superior al saldo, se registra el saldo exacto y se calcula el cambio devuelto.
  - **CA-07.3:** No se pueden registrar pagos en pedidos cancelados ni con saldo $0.
* **RF-08 (Seguridad en Tracking Público):**
  - **CA-08.1:** El tracking (`GET /api/orders/track/:referencia`) exige validar el número telefónico o correo del cliente (`cliente_contacto`).
  - **CA-08.2:** Si el contacto no coincide, el servidor responde `403 Forbidden` ocultando datos sensibles.
* **RF-09 (Validaciones de Entrada):**
  - **CA-09.1:** Validación estricta con esquemas tipados; cantidades negativas, precios menores a cero o IDs vacíos son rechazados con `400 Bad Request`.
* **RF-10 (Dashboard con Persistencia Real):**
  - **CA-10.1:** Métricas de ventas, estados de pedidos y alertas de stock bajo se calculan en backend directamente sobre consultas agregadas en Prisma.
* **RF-11 (Motor de Promociones y Cupones):**
  - **CA-11.1:** Se valida vigencia por fechas (`fecha_inicio <= now <= fecha_fin`) y `minimo_compra`.
  - **CA-11.2:** Regla estricta de no acumulación: solo un cupón válido por pedido.
* **RF-12 (Seguridad y Roles en Servidor):**
  - **CA-12.1:** Middleware `requireRole` valida roles de negocio (`ADMIN`, `SUPERVISOR`, `VENDEDOR`, `PREPARADOR`) devolviendo `401 Unauthorized` si no hay rol o `403 Forbidden` si no cuenta con permisos.
* **RF-13 (Snapshots Inmutables y Trazabilidad):**
  - **CA-13.1:** `OrderItem` congela `nombre_snapshot`, `precio_base_snapshot` y `opciones_snapshot` (JSON) en el momento de la compra; cambios futuros en el producto no alteran el pedido.
  - **CA-13.2:** Cada creación de pedido, cambio de estado y pago genera un registro inmutable en `ActivityLog`.

## 5. Dirección visual y stack tecnológico confirmado

Concepto creativo: “Taller creativo premium”. Fondos cálidos/neutros, grafito profundo y acento eléctrico. La tienda web prioriza fotografía protagonista, composición editorial y configurador reactivo; el POS prioriza alta legibilidad, botones amplios y rapidez operativa.

| **Capa** | **Tecnología confirmada** | **Justificación para el equipo** |
| --- | --- | --- |
| **Frontend** | React + TypeScript + Vite | Recarga instantánea, tipado compartido con backend y modularidad para Sofía (Store) y Esneider (POS/Admin). |
| **Estilos y UI** | Tailwind CSS | Configuración rápida de tokens de diseño (paleta, tipografía, bordes) y componentes reutilizables. |
| **Backend / API** | Node.js + Express + TypeScript | API REST rápida, middlewares de roles y lógica centralizada de cálculo de precios. |
| **Base de datos** | PostgreSQL | Integridad relacional para pedidos, pagos, inventario y soporte nativo de columnas JSON para snapshots. |
| **ORM y Migraciones** | Prisma ORM | Esquema único legible (schema.prisma), migraciones reproducibles, tipado automático para Yeimer/Julio y Prisma Studio para QA. |
| **Sincronización** | Polling / Refetch fiable (WebSockets opcional) | Garantiza estabilidad en la demo sin bloquear el flujo base. |

## 6. Modelo de datos consolidado (10 Entidades en Prisma)

Tras auditar los requisitos funcionales del documento v0.2 contra el modelo conceptual, se confirman exactamente 10 entidades en Prisma ORM, incorporando los campos críticos de inventario bajo, origen del pedido, separación de estado de pago, snapshots inmutables y unificación de auditoría/historial:

| **#** | **Entidad (Modelo Prisma)** | **Campos clave incluidos** | **Requisitos que resuelve** |
| --- | --- | --- | --- |
| **1** | Usuario (User) | id, nombre, email, password_hash, rol (ADMIN, SUPERVISOR, VENDEDOR, PREPARADOR), activo, created_at | Autenticación y permisos en backend (RF-12). |
| **2** | Producto (Product) | id, nombre, descripcion, imagen_url, categoria, precio_base, stock_actual, stock_minimo, activo | Catálogo (RF-01) y alerta de inventario bajo en Dashboard (RF-10, RF-14). |
| **3** | Opción de Personalización (ProductOption) | id, product_id, nombre, tipo (SELECT, TEXT, COLOR), obligatorio, valores_recargos (JSON con valor y recargo) | Configurador visual y cálculo de extras en backend (RF-02). |
| **4** | Pedido (Order) | id, referencia (única), origen (WEB, POS), cliente_nombre, cliente_contacto (validación tracking), fecha_deseada, estado_pedido, estado_pago, subtotal, total_extras, total_descuento, total_final, total_pagado, notas, creado_por_id | Pedidos web/POS, estados separados y consulta segura del cliente (RF-03 a RF-08). |
| **5** | Ítem de Pedido (OrderItem) | id, order_id, product_id, nombre_snapshot, cantidad, precio_base_snapshot, opciones_snapshot (JSON con elecciones y recargos), subtotal_item | Instantánea inmutable del encargo aunque cambie el catálogo (RF-13). |
| **6** | Registro de Pago (Payment) | id, order_id, monto, tipo (ANTICIPO, SALDO, TOTAL), metodo (EFECTIVO, TRANSFERENCIA, DEMO), registrado_por_id, fecha | Gestión de anticipos y saldos pendientes (RF-07). |
| **7** | Promoción (Promotion) | id, nombre, codigo (único opcional), tipo (PORCENTAJE, FIJO), valor, alcance, minimo_compra, fecha_inicio, fecha_fin, activo | Reglas de promociones por código/vigencia y no acumulación (RF-11). |
| **8** | Descuento Aplicado (OrderDiscount) | id, order_id, promotion_id (opcional), codigo_snapshot, tipo (PROMOCION, MANUAL), valor_configurado, monto_descontado, razon_manual, autorizado_por_id | Instantánea del descuento y auditoría de quién lo aplicó (RF-11, RF-13, RF-17). |
| **9** | Movimiento de Inventario (InventoryMovement) | id, product_id, tipo (ENTRADA, SALIDA_VENTA, AJUSTE), cantidad, motivo, usuario_id, fecha | Control y trazabilidad básica de existencias (RF-14). |
| **10** | Registro de Actividad (ActivityLog) | id, order_id (opcional), usuario_id (opcional), accion (CAMBIO_ESTADO, DESCUENTO_MANUAL, etc.), detalle_anterior, detalle_nuevo, fecha | Unifica historial de estados del pedido (RF-06), feed del Dashboard (RF-10) y auditoría (RF-19). |

## 7. Estructura definitiva del repositorio (Monorepo FORMA)

Esta estructura garantiza que los 6 integrantes trabajen en paralelo sobre una sola base de código sin conflictos de Git ni duplicación de lógica:

```text
forma-project/
├── README.md                         # Guía de instalación, scripts, variables y GitHub Flow (Julio)
├── .gitignore                        # Ignora node_modules, dist, .env
├── docs/
│   ├── api-contract.md               # Endpoints, payloads y códigos de respuesta (Julio + Yeimer)
│   ├── design-tokens.md              # Paleta, tipografía y reglas UI (Sofía + Esneider)
│   └── qa-test-matrix.md             # Casos de prueba y checklist de demo (Thomas)
│
├── frontend/                         # React + TypeScript + Vite + Tailwind CSS
│   ├── package.json
│   ├── tailwind.config.js            # Tokens de 'Taller creativo premium'
│   └── src/
│       ├── assets/                   # Imágenes semilla de productos y recursos de marca
│       ├── components/
│       │   ├── ui/                   # Botones, inputs, badges de estado, modales (Sofía + Esneider)
│       │   └── layout/               # Navbar tienda, Sidebar POS/Admin
│       ├── modules/
│       │   ├── store/                # [Sofía] Catálogo público, Configurador visual, Checkout web y Tracking
│       │   ├── pos/                  # [Esneider] Punto de venta rápido, carrito presencial y registro de anticipo/pago
│       │   └── admin/                # [Esneider + Sofía] Dashboard KPI, Panel de pedidos, Catálogo y Promociones
│       ├── services/                 # Cliente HTTP (fetch/axios) hacia /api/*
│       ├── context/                  # Estado de sesión/rol activo para la demo y carrito
│       ├── types/                    # Interfaces TypeScript alineadas con el contrato API
│       └── App.tsx                   # Enrutador principal (/tienda, /seguimiento, /pos, /admin)
│
└── backend/                          # Node.js + Express + TypeScript + Prisma ORM
    ├── package.json
    ├── tsconfig.json
    ├── .env.example                  # Plantilla DATABASE_URL, PORT, JWT_SECRET
    ├── prisma/                       # [Duvan + Yeimer]
    │   ├── schema.prisma             # Definición de las 10 entidades y enums
    │   ├── migrations/               # Historial SQL generado por Prisma
    │   └── seed.ts                   # Datos semilla repetibles (usuarios por rol, productos, opciones, pedidos, promos)
    └── src/                          # [Julio + Yeimer]
        ├── config/
        │   └── prisma.ts             # Instancia singleton de PrismaClient
        ├── middlewares/
        │   ├── authRole.middleware.ts # Validación de rol (ADMIN, SUPERVISOR, VENDEDOR, PREPARADOR)
        │   └── error.middleware.ts   # Manejo estandarizado de errores HTTP
        ├── modules/
        │   ├── products/             # [Yeimer] CRUD catálogo, opciones e inventario básico
        │   ├── orders/               # [Yeimer + Julio] Creación WEB/POS, snapshots, cambio de estado y tracking
        │   ├── payments/             # [Yeimer] Registro de anticipos/saldos y actualización de estado_pago
        │   ├── promotions/           # [Julio] Validación de códigos, vigencia y descuentos manuales
        │   ├── dashboard/            # [Julio] Agregaciones de ventas, estados, stock bajo y ActivityLog
        │   └── users/                # [Julio] Consulta de usuarios/roles para selector o login de demo
        ├── utils/
        │   ├── priceCalculator.ts    # Fuente única de verdad para subtotal + extras - descuento
        │   └── referenceGenerator.ts # Generador de códigos únicos (ej. FORMA-1042)
        ├── app.ts                    # Configuración Express, CORS y rutas /api/*
        └── server.ts                 # Arranque del servidor
```

## 8. Contratos de API iniciales

- **GET /api/products | POST /api/products | PATCH /api/products/:id:** Consultar catálogo público o crear/editar productos y sus opciones (ADMIN).
- **POST /api/orders/calculate:** Precalcular en backend precio base + recargos de opciones - promoción antes de confirmar.
- **POST /api/orders:** Crear pedido con origen (WEB o POS), guardando snapshots en OrderItem y OrderDiscount.
- **GET /api/orders | GET /api/orders/:id:** Listar y filtrar pedidos en el panel interno según permisos del rol.
- **GET /api/orders/track/:reference?contact=...:** Consulta pública del cliente validando código de referencia y teléfono/email.
- **PATCH /api/orders/:id/status:** Actualizar estado del pedido validando transiciones permitidas y creando registro en ActivityLog.
- **POST /api/orders/:id/payments:** Registrar anticipo o pago de saldo y recalcular total_pagado y estado_pago.
- **GET /api/promotions | POST /api/promotions | POST /api/promotions/validate:** Gestionar y validar códigos promocionales.
- **POST /api/orders/:id/discounts:** Aplicar descuento manual con razón y validación de rol/límite.
- **GET /api/dashboard/summary?period=today|7d:** Obtener indicadores reales, stock bajo y actividad reciente.

## 9. Equipo, metodología Scrumban, GitHub Flow y QA

| **Integrante** | **Responsabilidad principal** | **Módulos asignados en el repositorio** |
| --- | --- | --- |
| **Julio — Líder + Backend** | Coordinar alcance, desbloquear al equipo, cálculo de precios, promos, dashboard y middlewares de rol. | backend/src/modules/{promotions,dashboard,users}, middlewares/, utils/ |
| **Sofía — Diseño + Frontend Store** | Dirección visual, tokens de diseño y experiencia de tienda pública y configurador visual. | frontend/src/modules/store/, components/ui/, tailwind.config.js |
| **Esneider — Diseño + Frontend POS/Admin** | Interfaz POS, panel de pedidos, vista de dashboard y componentes compartidos. | frontend/src/modules/{pos,admin}/, components/ui/ |
| **Duvan — Base de Datos** | Esquema Prisma de 10 entidades, relaciones, migraciones y script de datos semilla repetibles. | backend/prisma/{schema.prisma,migrations,seed.ts} |
| **Yeimer — Backend de Datos** | Servicios Prisma de productos, opciones, pedidos, pagos e inventario en coordinación con Julio. | backend/src/modules/{products,orders,payments}/ |
| **Thomas — QA / Tester** | Matriz de casos de prueba, validación de permisos/precios/estados, pruebas en Prisma Studio y UI. | docs/qa-test-matrix.md + GitHub Issues + validación de PRs |

> ### **FLUJO DE TRABAJO Y REGLAS DE ORO**
> - Tablero único en GitHub Projects: Backlog → Preparado → En progreso → Revisión → QA → Hecho.
> - Ramas cortas desde main: feature/FORMA-XX-descripcion, fix/FORMA-XX-descripcion, docs/FORMA-XX-descripcion.
> - Definition of Done: Criterios cumplidos + PR revisado + validado por Thomas + integrado en main sin romper la demo.
