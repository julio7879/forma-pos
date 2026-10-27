# Contrato de API - FORMA POS

> **Responsables:** Julio + Yeimer  
> **Base URL:** `/api`

Documento vivo de endpoints, payloads y códigos de respuesta estandarizados.

## Estructura de Respuestas

### Éxito
```json
{
  "success": true,
  "data": {}
}
```

### Error
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
