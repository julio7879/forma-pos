---
name: forma-auditor-pr
description: Audita Pull Requests abiertos hacia develop verificando fronteras del monorepo, compilación, ausencia de secretos y cumplimiento de candados de negocio (RF-02, RF-05, RF-07, RF-11, RF-12, RF-13), generando la lista de pruebas para Thomas (QA).
---

# FORMA Auditor de Pull Requests y QA

## Objetivo
Proteger la rama `develop` antes de que el líder (Julio) haga merge de un Pull Request y entregarle a Thomas (QA) la guía exacta de verificación.

## Procedimiento de Auditoría
Cuando se solicite revisar un PR (`gh pr view <num>` y `gh pr diff <num>`):
1. **Seguridad y Limpieza:**
   - Verifica que no incluya archivos `.env`, tokens, credenciales ni carpetas `node_modules/` o `dist/`.
   - Comprueba que solo modifique las carpetas asignadas al integrante según `docs/CONTEXTO_IA_EQUIPO.md`.
2. **Candados de Negocio de FORMA:**
   - **RF-02:** El frontend no debe calcular totales finales como fuente de verdad; el backend debe usar `priceCalculator.ts`.
   - **RF-05 / RF-07:** `Order` debe manejar `estado_pedido` y `estado_pago` por separado.
   - **RF-11:** Las promociones no deben acumularse.
   - **RF-12:** Las rutas administrativas o operativas deben estar protegidas con `requireRole([...])`.
   - **RF-13:** Al crear pedidos o descuentos, se deben guardar los campos `*_snapshot` en `OrderItem` y `OrderDiscount`.
3. **Verificación de Compilación:**
   - Comprueba que `npm run build` funcione sin errores en el paquete afectado (`frontend` o `backend`).
4. **Reporte de Auditoría y Checklist para Thomas (QA):**
   - Devuelve un dictamen claro (**Aprobado para Merge** o **Requiere Ajustes**) y la lista de pasos de prueba para QA.
   - Recuerda: **Nunca fusiones el PR por tu cuenta**; la decisión final de merge es exclusiva del líder.
