# Prototipo Interactivo y Flujos de Navegación — FORMA

> Sistema integral para taller creativo premium de personalización artesanal (camisetas, tazas, libretas, botellas y regalos corporativos).

---

## 🌐 Enlace al Prototipo en Vivo

- **Lovable (Demo Interactiva):** [https://forma-gilded-cart.lovable.app](https://forma-gilded-cart.lovable.app)
- **Selector de Roles:** La aplicación incluye un selector global (`Cliente` · `Vendedor` · `Admin`) en la cabecera y en los menús móviles para alternar entre interfaces sin salir de la sesión.

---

## 🧭 Las 3 Interfaces del Sistema

FORMA articula tres roles operativos claramente diferenciados por colorimetría, densidad de información y objetivos de negocio:

| Rol               | Interfaz                      | Propósito Principal                                                                       |
| :---------------- | :---------------------------- | :---------------------------------------------------------------------------------------- |
| **Cliente**       | Tienda Web & Configurador     | Explorar catálogo, personalizar piezas en tiempo real, ordenar y rastrear su pedido.      |
| **Vendedor**      | Terminal POS (Punto de Venta) | Agilizar ventas presenciales, cobro de anticipos (50%) o totales y entregas en mostrador. |
| **Administrador** | Panel de Control Operativo    | Monitorear KPIs, despachos, ciclo de pedidos, catálogo y reglas de promociones.           |

---

## 🛍️ Flujo 1: Experiencia del Cliente (Tienda Web)

### 1.1 Página Principal & Propuesta de Valor (`/`)

- **Hero interactivo:** Llamado a la acción principal con atmósfera visual nocturna (_Ink & Gilded Accent_).
- **Ruta en 3 pasos:** Explicación del proceso artesanal (Elige la pieza → Diseña y personaliza → Recibe tu obra).
- **Acceso directo a roles:** Sección con accesos dedicados a las experiencias de Cliente, Vendedor y Administrador.
- **Móvil:** Menú hamburguesa deslizable con navegación rápida y selector de perfil.

### 1.2 Catálogo de Productos (`/catalogo`)

- **Diseño responsive:** Cuadrícula de 2 columnas compactas en celulares y 3 columnas en escritorio.
- **Filtros interactivos:** Filtrado dinámico por categorías (Todos, Prendas, Accesorios, Papelería, Hogar) y buscador por texto.
- **Tarjetas de producto:** Fotografía protagonista, precio base en COP, categoría y badge de estado.

### 1.3 Configurador Visual de Producto (`/producto/$id`)

- **Opciones de personalización en vivo:**
  - Selección de color de base mediante muestras cromáticas (_swatches_).
  - Selección de talla o formato según el tipo de producto.
  - Selección de acabado (ej. Serigrafía manual, Bordado premium, Grabado láser).
  - Campo de texto personalizado para dedicatorias, nombres o frases.
- **Lógica de recargos dinámicos:**
  - Los acabados especiales y el texto grabado aplican recargos automáticos (ej. +$8.000 COP por personalización de texto).
  - El desglose de recargos se actualiza en tiempo real antes de añadir la pieza al carrito.

### 1.4 Checkout & Confirmación (`/checkout`)

- **Resumen detallado:** Listado de productos con desglose de opciones seleccionadas y costo total.
- **Formulario de entrega:** Datos de contacto del cliente, dirección, teléfono y notas especiales de confección.
- **Generación de ID único:** Al confirmar la orden, el sistema genera una referencia de rastreo única con formato `FRM-XXXX` (ej. `FRM-8201`).

### 1.5 Seguimiento de Pedidos (`/seguimiento`)

- **Buscador por tracking:** Consulta inmediata mediante código de orden.
- **Línea de tiempo de estados:** Indicador visual de 5 etapas:
  `Recibido` ➔ `Confirmado` ➔ `En preparación` ➔ `Listo` ➔ `Entregado`.
- **Badges de pago:** Estado financiero visible (`Pendiente`, `Anticipo registrado`, `Pagado`).

---

## ⚡ Flujo 2: Experiencia del Vendedor (Terminal POS — `/pos`)

Diseñado para trabajo ágil en mostrador, pantallas táctiles y teléfonos móviles:

- **Búsqueda ultrarrápida:** Barra de búsqueda optimizada para encontrar productos en segundos.
- **Cuadrícula táctil de 2 columnas:** Botones grandes de adición rápida al pedido actual.
- **Carrito persistente y móvil:**
  - _En escritorio:_ Barra lateral siempre visible con cantidades, subtotal y total.
  - _En celular:_ Pestaña flotante lateral con flecha dorada y contador de artículos que despliega el resumen en un panel lateral (`Sheet`).
- **Gestión de Cobro:**
  - Opción de registrar **Anticipo (50%)** para iniciar producción de piezas personalizadas.
  - Opción de **Pago Total** y emisión de orden con estado inmediato.

---

## 📊 Flujo 3: Experiencia del Administrador (`/admin/*`)

### 3.1 Dashboard Operativo (`/admin`)

- **Tarjetas de métricas (KPIs):** Ventas del día, pedidos activos en taller, pedidos pendientes de entrega e ingresos del mes.
- **Gráfico de rendimiento:** Visualización con Recharts del comportamiento de ventas semanal.
- **Alertas operativas:** Lista de pedidos urgentes que requieren confirmación o cambio de fase.

### 3.2 Gestión de Pedidos (`/admin/pedidos`)

- **Filtros multidimensionales:** Filtrado cruzado por estado de producción y estado de pago.
- **Panel de detalle:** Inspección de especificaciones de personalización enviadas por el cliente.
- **Transición de estados:** Control de avance de cada orden con actualización de etiquetas visuales.

### 3.3 Catálogo de Taller (`/admin/catalogo`)

- Supervisión del inventario activo, disponibilidad de piezas y modificación de precios base.

### 3.4 Promociones y Descuentos (`/admin/promociones`)

- Configuración de campañas promocionales con validación de la regla de negocio: **los cupones y descuentos no son acumulables**.

---

## 🎨 Sistema de Diseño (Design Tokens)

El sistema visual responde a la identidad **"Taller Creativo Premium"**, implementado mediante tokens semánticos en Tailwind CSS v4:

### Paleta de Colores Definitiva

| Token     | Nombre           | Hex       | Uso en UI                                                                         |
| :-------- | :--------------- | :-------- | :-------------------------------------------------------------------------------- |
| `ink`     | Tinta Profunda   | `#171717` | Fondo principal, textos sobre fondos claros y contraste maestro.                  |
| `accent`  | Dorado Artesanal | `#D19650` | Botones de acción principal (CTA), bordes activos, foco e insignias.              |
| `surface` | Café Taller      | `#734F46` | Tarjetas de contenido, paneles secundarios y fondos de sección.                   |
| `danger`  | Vino Tinto       | `#661521` | Banners corporativos, acciones destructivas, errores y acentos de administración. |
| `cream`   | Crema Natural    | `#E7DED2` | Tipografía principal de lectura sobre fondos oscuros y superficies suaves.        |
| `success` | Verde Oliva      | `#6B7A4F` | Estados de éxito, pedidos completados y pagos confirmados.                        |

### Tipografía y Espaciado

- **Titulares:** Playfair Display (Serif con carácter editorial y artesanal).
- **Cuerpo y Datos:** Inter (Sans-serif funcional para legibilidad en precios y formularios).
- **Bordes redondeados:** Jerarquía consistente de `4px` (insignias), `8px` (botones e inputs), `12px` (tarjetas) y `16px` (modales y contenedores).

---

## 📱 Adaptabilidad Móvil (Mobile First)

1. **Navegación tipo App:** Encabezados compactos con menú hamburguesa deslizable que contiene navegación, carrito y cambio de interfaz.
2. **Cuadrículas adaptadas:** Grid de 2 columnas verticales en catálogos y POS, evitando el scroll infinito de tarjetas sobredimensionadas.
3. **Controles deslizables:** Carrito del vendedor y menús de administración accesibles mediante cajones laterales (`Sheet`), optimizados para pulgar.

---

Este diseño de prototipo esta sometido a cambios por motivos de la limitación de tokens de la plataforma de diseño que se esta utilizando, en este caso Lovable, por eso se suguiere mantenerse actualizado con la url del prototipo proporcionada en este Readme.
