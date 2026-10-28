# Contrato de API (API Contract) - Fase 1

Este documento define los endpoints, payloads JSON y códigos de respuesta para el catálogo y la gestión de pedidos.

---

## 1. Estructura Base de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": { ... }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible del error"
  }
}
```

---

## 2. Catálogo de Productos (`/api/products`)

### `GET /api/products`

Lista todos los productos disponibles en el catálogo.

**Query Parameters (opcionales):**
- `category` (string): Filtrar por categoría.
- `limit` (int): Cantidad de elementos por página.

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "Hamburguesa Especial",
      "price": 28000,
      "category": "Comida Rápida"
    }
  ]
}
```

### `GET /api/products/:id`

Obtiene el detalle de un producto específico, incluyendo sus opciones de personalización.

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "Hamburguesa Especial",
    "price": 28000,
    "customization_options": [
      {
        "type": "Término de la carne",
        "choices": ["Tres cuartos", "Bien cocido"]
      },
      {
        "type": "Ingredientes extra",
        "choices": ["Tocineta", "Queso cheddar", "Jalapeños"]
      }
    ]
  }
}
```

---

## 3. Gestión de Pedidos (`/api/orders`)

### `POST /api/orders`

Crea un nuevo pedido en el sistema.

**Request Body:**

```json
{
  "customer_name": "Juan Pérez",
  "delivery_address": "Calle 10 # 5-20",
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 2,
      "customizations": {
        "term": "Bien cocido",
        "extras": ["Tocineta"]
      }
    }
  ]
}
```

**Respuesta exitosa (201 Created):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_98765",
    "status": "PENDING",
    "total": 58000,
    "created_at": "2026-10-27T22:00:00Z"
  }
}
```

### `GET /api/orders/:id`

Consulta el estado y detalle de un pedido por su ID.

**Respuesta exitosa (200 OK):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_98765",
    "status": "PROCESSING",
    "customer_name": "Juan Pérez",
    "total": 58000,
    "items": [...]
  }
}
```

---

## 4. Códigos de Estado HTTP

| Código | Descripción |
|---|---|
| `200 OK` | La solicitud y la lectura de datos se realizaron correctamente. |
| `201 Created` | El recurso (pedido) fue creado exitosamente. |
| `400 Bad Request` | El JSON enviado tiene errores o faltan campos obligatorios. |
| `403 Forbidden` | No cuentas con los permisos necesarios para realizar esta acción. |
| `404 Not Found` | El producto o pedido consultado no existe en la base de datos. |
| `500 Internal Server Error` | Error inesperado en el servidor del backend. |