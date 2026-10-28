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

## 🎨 Hito 2: Sistema de Diseño "Taller Creativo Premium" y Modelo de 10 Entidades (En Progreso)
- **Issues activas en el Kanban:**
  - [#8](https://github.com/julio7879/forma-pos/issues/8) / [#2](https://github.com/julio7879/forma-pos/issues/2) — Guía de estilo y tokens visuales en Tailwind (**Sofía**).
  - [#3](https://github.com/julio7879/forma-pos/issues/3) — Componentes UI comunes: Button, Input, Badge, Modal (**Esneider**).
  - [#4](https://github.com/julio7879/forma-pos/issues/4) — Esquema Prisma de 10 entidades y primera migración SQL (**Duvan**).
  - [#5](https://github.com/julio7879/forma-pos/issues/5) — Contrato inicial de API para productos y pedidos (**Yeimer**).
  - [#7](https://github.com/julio7879/forma-pos/issues/7) — Matriz de pruebas QA y checklist de demo (**Thomas**).
