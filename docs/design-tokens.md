# FORMA — Sistema de Diseño UI

**FORMA** es una propuesta de diseño de interfaz para una tienda web, un sistema POS (punto de venta) y un panel administrativo. Su identidad visual busca transmitir una estética de taller creativo premium mediante una combinación de colores, tipografías y componentes de interfaz consistentes.

**Responsables:** Sofía y Esneider  
**Estilo visual:** Taller creativo premium

## 🎨 Sistema de diseño

El sistema de diseño reúne las reglas visuales que permiten mantener una apariencia coherente en las diferentes interfaces del proyecto.

### Paleta de colores configurada en Tailwind CSS

La configuración de `tailwind.config.js` define los siguientes colores:

| Color | Código HEX | Uso previsto |
|---|---|---|
| Negro (`ink`) | `#171717` | Fondo base y texto oscuro |
| Dorado (`accent`) | `#D19650` | Botones de acción, elementos destacados y acentos |
| Vinotinto (`danger`) | `#661521` | Errores y botones de acciones peligrosas |
| Café (`surface`) | `#734F46` | Tarjetas y paneles secundarios |
| Crema (`cream`) | `#E7DED2` | Elementos claros y botones |
| Verde oliva (`success`) | `#6B7A4F` | Estados de éxito, como pedidos listos o pagados |

También se utilizan dos colores semánticos adicionales:

- **Advertencia (`warning`):** `#D19650`, correspondiente al dorado.
- **Información (`info`):** `#734F46`, correspondiente al café.

Los colores semánticos permiten identificar visualmente diferentes estados y tipos de mensajes dentro de la interfaz.

### Paleta propuesta en Design Tokens

El documento `design-tokens(1).md` presenta una propuesta visual alternativa:

| Color | Código HEX | Uso o propósito |
|---|---|---|
| Fondo cálido | `#FDFBF7` | Lienzo de estilo artesanal premium |
| Fondo cálido secundario | `#F7F4EE` | Variante de fondo |
| Grafito | `#1F2421` | Texto principal, contrastes y jerarquía |
| Acento eléctrico | `#FF5A36` | Acciones principales y botones destacados |
| Acento alternativo | `#E04826` | Estados y acciones importantes |
| Neutro secundario | `#E6E1D8` | Elementos neutros |
| Gris cálido | `#8C857B` | Elementos secundarios |

**Nota:** ambas paletas están documentadas por separado porque presentan diferencias. Antes de aplicar los colores definitivamente, el equipo debe confirmar cuál será la paleta oficial del proyecto.

## 🔤 Tipografía

La configuración de Tailwind CSS propone dos familias tipográficas:

- **Playfair Display:** para títulos y encabezados, aportando un estilo elegante.
- **Inter:** para textos generales, formularios y elementos de interfaz, favoreciendo la legibilidad.

Esta combinación busca equilibrar una identidad visual distintiva con una lectura clara y cómoda.

## 🧩 Componentes de interfaz

El sistema de diseño contempla las siguientes reglas:

### Botones
- Bordes suaves.
- Estados visuales de interacción, como `hover`.
- Variantes primarias y secundarias para diferenciar las acciones.

### Inputs y formularios
- Bordes sutiles.
- Indicadores visibles al seleccionar un campo.
- Uso del color de acento para resaltar el foco.

### Modales y badges
- Retroalimentación inmediata después de las acciones del usuario.
- Indicadores visuales para estados, mensajes y etiquetas.

### Bordes y esquinas

La configuración de Tailwind CSS define los siguientes radios de borde:

| Variante | Tamaño |
|---|---|
| `rounded-sm` | 4 px |
| `rounded` | 8 px |
| `rounded-md` | 12 px |
| `rounded-lg` | 16 px |

Estos valores permiten mantener una apariencia uniforme en tarjetas, botones, formularios y otros componentes.

## 🛠️ Tecnologías y configuración

El archivo `tailwind.config.js` utiliza Tailwind CSS para extender los estilos del proyecto.

La configuración incluye:

- **Rutas de contenido:** `index.html` y archivos JavaScript, TypeScript, JSX y TSX dentro de `src`.
- **Colores personalizados:** definidos dentro de `theme.extend.colors`.
- **Familias tipográficas:** Playfair Display e Inter.
- **Radios de borde:** tamaños personalizados para componentes.
- **Color de foco:** dorado `#D19650` como valor predeterminado de `ringColor`.
- **Plugins:** no se han configurado plugins adicionales en el archivo compartido.

## 🎯 Objetivos del sistema de diseño

1. Mantener la coherencia visual entre la tienda web, el punto de venta y el panel administrativo.
2. Definir colores y tipografías reutilizables.
3. Establecer reglas comunes para botones, formularios y otros componentes.
4. Facilitar el mantenimiento y la modificación de los estilos.
5. Proporcionar una base visual consistente para el desarrollo de la interfaz.

## 📁 Archivos de referencia

- `tailwind.config.js`: contiene la configuración de Tailwind CSS, los colores personalizados, las tipografías, los bordes y el color de foco.
- `design-tokens(1).md`: contiene las reglas de interfaz y una propuesta de paleta de colores para el proyecto FORMA.

## 📌 Estado del diseño

La documentación establece una base para organizar los estilos de FORMA. La paleta definitiva debe confirmarse entre los responsables antes de consolidar los colores en todos los componentes.

**FORMA — Una identidad visual coherente para una experiencia de compra organizada y consistente.**