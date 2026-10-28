---
name: forma-puente-supabase-mocks
description: Configura la conexión de Prisma con Supabase PostgreSQL (pooler 6543 y directUrl 5432), genera el seed.ts oficial de productos personalizados y crea datos mock idénticos para desbloquear el frontend de Sofía y Esneider.
---

# FORMA Puente Supabase, Seeds y Mocks Frontend

## Objetivo
1. Evitar el bloqueo clásico de Prisma con el Connection Pooler de Supabase (`pgbouncer`).
2. Permitir que Sofía (Tienda) y Esneider (POS/Admin) construyan sus pantallas de inmediato con datos simulados que tienen **exactamente la misma estructura y nombres de campos** que devolverá Supabase/Prisma.

## 1. Configuración de Supabase en Prisma (`backend/prisma/schema.prisma` y `.env.example`)
- En Supabase, Prisma necesita dos variables en `.env`:
  - `DATABASE_URL`: URL del Transaction Pooler (puerto `6543` con `?pgbouncer=true&connection_limit=1`) usada por el servidor Express en tiempo de ejecución.
  - `DIRECT_URL`: URL de conexión directa / Session Pooler (puerto `5432`) usada por `npx prisma migrate dev`.
- El bloque `datasource db` en `schema.prisma` usa:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```

## 2. Generación Sincronizada de `seed.ts` y Mocks de Frontend
Cuando se active esta skill para poblar datos:
1. Genera o actualiza `backend/prisma/seed.ts` con datos realistas del negocio **FORMA** (nunca comida rápida):
   - **Usuarios por rol:** `ADMIN`, `SUPERVISOR`, `VENDEDOR`, `PREPARADOR`.
   - **Catálogo de productos personalizados:** Camisetas estampadas, Tazas sublimadas, Termos grabados en láser, Libretas corporativas, Cajas de regalo.
   - **Opciones con recargo (`ProductOption`):** Ej. `[{ "valor": "Grabado láser personalizado", "recargo": 8000 }, { "valor": "Empaque premium", "recargo": 5000 }]`.
   - **Promociones y Pedidos de ejemplo** en distintos estados (`RECIBIDO`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`) y estados de pago (`PENDIENTE`, `ANTICIPO_PARCIAL`, `PAGADO`).
2. Genera en `frontend/src/services/mockData.ts` exactamente los mismos objetos tipados para que Sofía y Esneider puedan importar los datos mientras el backend termina de conectarse.
3. **Regla:** Todo cambio se prepara primero localmente y se consulta al líder antes de subir a GitHub.
