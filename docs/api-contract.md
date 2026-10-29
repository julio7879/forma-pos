# Contrato de API - FORMA POS

> **Responsables:** Julio + Yeimer  
> **Base URL:** `/api`
Este documento define los endpoints, payloads JSON y códigos de respuesta para el catálogo de productos personalizados y la gestión de pedidos de FORMA, alineados con la arquitectura oficial v0.3 y los modelos `Product` y `ProductOption` del esquema Prisma.

Documento vivo de endpoints, payloads y códigos de respuesta estandarizados.

## Estructura de Respuestas
## 1. Estructura base de respuestas

### Respuesta exitosa

### Éxito
```json
{
  "success": true,
  "data": {}
}
```

### Error
### Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Descripción legible del error"
  }
}
```

## Módulos Principales
- `/api/products` - CRUD catálogo, personalizaciones y stock
- `/api/orders` - Creación WEB/POS, snapshots y tracking
- `/api/payments` - Anticipos, saldos y estado de pago
- `/api/promotions` - Validación de códigos y descuentos
- `/api/dashboard` - Métricas agregadas y actividad
- `/api/users` - Gestión de usuarios y roles
---

## 2. Catálogo de productos (`/api/products`)

### `GET /api/products`

Lista los productos disponibles en el catálogo de FORMA.

**Query Parameters (opcionales):**

- `categoria` (string): Filtra los productos por categoría.
- `limit` (int): Cantidad máxima de elementos por respuesta.

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "nombre": "Camiseta personalizada",
      "descripcion": "Camiseta personalizable con diseños exclusivos.",
      "categoria": "Camisetas",
      "precio_base": 45000,
      "stock_actual": 50,
      "stock_minimo": 10,
      "imagen_url": "https://ejemplo.com/imagenes/camiseta.jpg"
    },
    {
      "id": "prod_002",
      "nombre": "Termo grabado",
      "descripcion": "Termo reutilizable con opción de grabado personalizado.",
      "categoria": "Termos",
      "precio_base": 35000,
      "stock_actual": 30,
      "stock_minimo": 5,
      "imagen_url": "https://ejemplo.com/imagenes/termo.jpg"
    }
  ]
}
```

### `GET /api/products/:id`

Obtiene el detalle de un producto específico, incluyendo sus opciones de personalización y los recargos correspondientes.

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "nombre": "Camiseta personalizada",
    "descripcion": "Camiseta personalizable con diseños exclusivos.",
    "categoria": "Camisetas",
    "precio_base": 45000,
    "stock_actual": 50,
    "stock_minimo": 10,
    "imagen_url": "https://ejemplo.com/imagenes/camiseta.jpg",
    "options": [
      {
        "id": "opt_001",
        "nombre": "Tipo de estampado",
        "valores_recargos": [
          {
            "valor": "Estampado básico",
            "recargo": 0
          },
          {
            "valor": "Estampado premium",
            "recargo": 10000
          }
        ]
      },
      {
        "id": "opt_002",
        "nombre": "Personalización adicional",
        "valores_recargos": [
          {
            "valor": "Nombre personalizado",
            "recargo": 5000
          },
          {
            "valor": "Diseño exclusivo",
            "recargo": 15000
          }
        ]
      }
    ]
  }
}
```

**Consideraciones:**

- `precio_base` representa el precio inicial del producto.
- `options` contiene las opciones de personalización disponibles.
- `valores_recargos` especifica los valores seleccionables y el recargo asociado a cada uno.
- Los recargos deben ser calculados por el backend utilizando los valores registrados para cada producto.
- Los precios monetarios se expresan en pesos colombianos (COP), como números enteros.

---

## 3. Gestión de pedidos (`/api/orders`)

### `POST /api/orders`

Crea un nuevo pedido en el sistema, ya sea desde la tienda web o desde el punto de venta (POS).

**Request Headers:**

```http
Content-Type: application/json
x-user-role: CLIENTE
```

El encabezado `x-user-role` representa el rol requerido por el endpoint, de acuerdo con las reglas de autorización del backend.

**Request Body:**

```json
{
  "origen": "WEB",
  "cliente_nombre": "Juan Pérez",
  "cliente_contacto": "3001234567",
  "delivery_address": "Calle 10 # 5-20",
  "items": [
    {
      "product_id": "prod_001",
      "cantidad": 2,
      "opciones": [
        {
          "option_id": "opt_001",
          "valor": "Estampado premium"
        },
        {
          "option_id": "opt_002",
          "valor": "Nombre personalizado"
        }
      ]
    }
  ]
}
```

**Consideraciones del request:**

- `origen` admite los valores `WEB` o `POS`.
- `cliente_nombre` identifica al cliente que realiza el pedido.
- `cliente_contacto` contiene la información de contacto del cliente.
- `delivery_address` representa la dirección de entrega cuando corresponda.
- `product_id` identifica el producto seleccionado.
- `cantidad` indica las unidades solicitadas.
- `opciones` contiene las personalizaciones seleccionadas.
- El backend valida los productos, las cantidades, las opciones y los recargos antes de crear el pedido.
- Los campos de precios, totales y snapshots son calculados o generados por el backend; el cliente no debe establecerlos como valores confiables.

**Respuesta exitosa (201 Created):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_98765",
    "referencia": "FORMA-1042",
    "origen": "WEB",
    "cliente_nombre": "Juan Pérez",
    "cliente_contacto": "3001234567",
    "estado_pedido": "RECIBIDO",
    "estado_pago": "PENDIENTE",
    "subtotal": 90000,
    "total_extras": 30000,
    "total_descuento": 0,
    "total_final": 120000,
    "total_pagado": 0,
    "items": [
      {
        "product_id": "prod_001",
        "cantidad": 2,
        "nombre_snapshot": "Camiseta personalizada",
        "precio_base_snapshot": 45000,
        "opciones_snapshot": [
          {
            "nombre": "Tipo de estampado",
            "valor": "Estampado premium",
            "recargo": 10000
          },
          {
            "nombre": "Personalización adicional",
            "valor": "Nombre personalizado",
            "recargo": 5000
          }
        ],
        "subtotal_item": 120000
      }
    ],
    "created_at": "2026-10-28T22:00:00Z"
  }
}
```

**Reglas de cálculo:**

- `subtotal`: suma del precio base por la cantidad de cada producto.
- `total_extras`: suma de los recargos de las opciones seleccionadas, multiplicados por las cantidades correspondientes.
- `total_descuento`: valor total de los descuentos aplicados.
- `total_final`: subtotal más extras menos descuentos.
- `total_pagado`: suma de los pagos registrados para el pedido.
- `subtotal_item`: importe total de la línea del pedido, incluyendo los extras y antes de distribuir descuentos, cuando corresponda.

Los valores del ejemplo son ilustrativos. El backend debe calcularlos a partir de los precios y recargos reales almacenados en la base de datos.

### Estados del pedido

El campo `estado_pedido` admite los siguientes valores:

| Estado | Descripción |
|---|---|
| `RECIBIDO` | El pedido ha sido registrado en el sistema. |
| `EN_PREPARACION` | El pedido está siendo elaborado o personalizado. |
| `LISTO` | El pedido está listo para su entrega. |
| `ENTREGADO` | El pedido ha sido entregado al cliente. |
| `CANCELADO` | El pedido ha sido cancelado. |

### Estados del pago

El campo `estado_pago` admite los siguientes valores:

| Estado | Descripción |
|---|---|
| `PENDIENTE` | El pedido todavía no registra pagos suficientes. |
| `ANTICIPO_PARCIAL` | Se ha registrado un anticipo, pero queda un saldo pendiente. |
| `PAGADO` | El importe total del pedido ha sido pagado. |

El estado del pedido y el estado del pago son independientes: un pedido puede estar en preparación mientras su pago permanece pendiente o parcial.

### `GET /api/orders/:id`

Consulta el estado y el detalle de un pedido mediante su identificador.

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_98765",
    "referencia": "FORMA-1042",
    "origen": "WEB",
    "cliente_nombre": "Juan Pérez",
    "cliente_contacto": "3001234567",
    "delivery_address": "Calle 10 # 5-20",
    "estado_pedido": "EN_PREPARACION",
    "estado_pago": "ANTICIPO_PARCIAL",
    "subtotal": 90000,
    "total_extras": 30000,
    "total_descuento": 0,
    "total_final": 120000,
    "total_pagado": 60000,
    "items": [
      {
        "product_id": "prod_001",
        "cantidad": 2,
        "nombre_snapshot": "Camiseta personalizada",
        "precio_base_snapshot": 45000,
        "opciones_snapshot": [
          {
            "nombre": "Tipo de estampado",
            "valor": "Estampado premium",
            "recargo": 10000
          },
          {
            "nombre": "Personalización adicional",
            "valor": "Nombre personalizado",
            "recargo": 5000
          }
        ],
        "subtotal_item": 120000
      }
    ],
    "created_at": "2026-10-28T22:00:00Z"
  }
}
```

**Consideraciones:**

- `order_id` identifica el pedido en el sistema.
- `referencia` proporciona un código legible para identificarlo, como `FORMA-1042`.
- `estado_pedido` y `estado_pago` informan por separado el estado operativo y financiero.
- Los snapshots conservan la información del producto y de las opciones utilizadas al momento de realizar el pedido, aunque el catálogo cambie posteriormente.
- `total_pagado` refleja los pagos registrados y no debe confundirse con `total_final`.

---

## 4. Códigos de estado HTTP

| Código | Descripción |
|---|---|
| `200 OK` | La solicitud y la lectura de datos se realizaron correctamente. |
| `201 Created` | El recurso, en este caso un pedido, fue creado exitosamente. |
| `400 Bad Request` | El JSON enviado contiene errores, faltan campos obligatorios o los datos no cumplen las validaciones. |
| `401 Unauthorized` | El encabezado `x-user-role` falta, es inválido o no cumple los requisitos de autenticación definidos para el endpoint. |
| `403 Forbidden` | El usuario tiene un rol válido, pero no cuenta con los permisos necesarios para realizar la acción. |
| `404 Not Found` | El producto o pedido consultado no existe en la base de datos. |
| `500 Internal Server Error` | Se produjo un error inesperado en el servidor del backend. |

### Ejemplo de respuesta de error

**Solicitud con un producto inexistente (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "El producto solicitado no existe."
  }
}
```

**Solicitud con un rol faltante o inválido (401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "El encabezado x-user-role falta o contiene un rol inválido."
  }
}
```

---

## 5. Consideraciones de implementación

1. **Consistencia con Prisma:** los nombres de los campos deben corresponder con el modelo oficial `Product`, el modelo `ProductOption` y los modelos de pedidos definidos en el esquema Prisma. Los nombres de las relaciones y los campos internos deben verificarse contra dicho esquema antes de implementar los endpoints.

2. **Cálculo de precios:** el backend debe obtener los precios base y los recargos desde la base de datos. No debe confiar en los totales enviados por el frontend.

3. **Snapshots de los pedidos:** al crear un pedido, el backend debe registrar el nombre del producto, el precio base y las opciones seleccionadas en los campos snapshot correspondientes.

4. **Separación de estados:** `estado_pedido` y `estado_pago` deben gestionarse de forma independiente, respetando los valores admitidos por el negocio.

5. **Origen del pedido:** el campo `origen` debe permitir identificar si el pedido fue generado desde la tienda web (`WEB`) o desde el punto de venta (`POS`).

6. **Autorización:** los endpoints deben validar el encabezado `x-user-role` y aplicar las reglas de acceso correspondientes a cada operación.

7. **Formato monetario:** todos los importes se expresan en pesos colombianos (COP), como números enteros, sin separadores de miles ni símbolos monetarios dentro del JSON.

8. **Validación de inventario:** antes de aceptar un pedido, el backend debe comprobar que exista disponibilidad suficiente para los productos solicitados, según las reglas de inventario del proyecto.

9. **Integridad de los pedidos:** la creación del pedido y sus ítems debe mantener la consistencia de los datos, evitando pedidos incompletos si falla alguna operación necesaria.

---

**Nota:** Este contrato define la estructura esperada de las solicitudes y respuestas. Antes de implementar o fusionar los cambios, se deben verificar los nombres exactos de los campos, las relaciones, los tipos de datos y los valores de los enums contra la arquitectura oficial v0.3 y el esquema Prisma del proyecto.
