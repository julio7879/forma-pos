---
name: forma-evaluador-progreso
description: Evalúa en tiempo real el progreso del proyecto FORMA frente a la fecha límite del 31 de octubre, cruzando código real, Issues y PRs contra los requisitos funcionales RF-01 a RF-19 y el modelo de 10 entidades.
---

# FORMA Evaluador de Progreso y Cumplimiento (Sprint 28–31 Oct)

## Objetivo
Darle a Julio (Líder) una radiografía exacta de qué porcentaje real del MVP está construido, qué requisitos funcionales (`RF-01` a `RF-19`) están cumplidos en código y qué bloqueos ponen en riesgo la entrega del **31 de octubre**.

## Procedimiento de Evaluación
Cuando el líder invoque esta skill:
1. **Inspeccionar Estado Real (GitHub + Código):**
   - Ejecuta `gh issue list --state all` y `gh pr list --state all`.
   - Revisa qué archivos existen y compilan realmente en `backend/src/modules/`, `backend/prisma/`, `frontend/src/modules/` y `docs/`.
2. **Evaluar contra el Calendario Crítico (28 al 31 de Octubre):**
   - **Día 1 (28 Oct — Cimientos):** Supabase conectado, `schema.prisma` (10 entidades) migrado, Express base, Contrato API, Tokens Tailwind, Componentes UI y Matriz QA.
   - **Día 2 (29 Oct — Núcleo MVP):** `GET /api/products`, `POST /api/orders` con `priceCalculator.ts` (`RF-01` a `RF-05`, `RF-13`), Catálogo + Configurador de Sofía y POS de Esneider.
   - **Día 3 (30 Oct — Operación y Finanzas):** Cambio de estados (`RF-06`), Anticipos/Pagos (`RF-07`), Tracking público (`RF-08`), Dashboard (`RF-10`), Promociones (`RF-11`) y Roles (`RF-12`).
   - **Día 4 (31 Oct — Cierre y Demo):** Pruebas finales de Thomas, despliegue en Vercel + Render + Supabase y exportación de `docs/EVIDENCIA_JURADO.md`.
3. **Entregar Reporte Ejecutivo al Líder:**
   - **Tabla de Progreso por Integrante:** `% de avance`, tarea actual, PR abierto/pendiente y estado (`🟢 Al día`, `🟡 En riesgo`, `🔴 Bloqueado`).
   - **Matriz de Cumplimiento de Requisitos (`RF-01` a `RF-19`):** Cuáles ya están en `develop`, cuáles están en revisión y cuáles no se han iniciado.
   - **Las 3 Acciones Prioritarias del Día:** Qué debe destrabar Julio en las próximas horas para asegurar la meta del 31 de octubre.
