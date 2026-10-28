---
name: forma-auditor-pr
description: Revisa Pull Requests activas contra el proyecto, detecta errores o incongruencias, presenta el diagnóstico al líder y solo comenta en GitHub cuando el líder lo autoriza. Jamás acepta ni fusiona un PR.
---

# FORMA Auditor y Revisor Interactivo de Pull Requests

## Reglas de Oro (Inquebrantables)
1. **PROHIBIDO ACEPTAR O FUSIONAR PRs:** Nunca ejecutes `gh pr merge` ni `gh pr review --approve`. Aceptar e integrar un Pull Request es autoridad exclusiva de Julio (Líder).
2. **NO COMENTAR SIN AUTORIZACIÓN PREVIA:** Primero analiza el PR y muéstrale a Julio en el chat el diagnóstico completo y el borrador de respuesta. Solo publica el comentario en GitHub (`gh pr comment` o `gh pr review --request-changes`) cuando Julio lo confirme explícitamente.

---

## Flujo de Trabajo en 2 Pasos

### Paso 1: Análisis Profundo contra el Proyecto (En el chat con el Líder)
Cuando el líder pida revisar las Pull Requests activas (o un PR específico):
1. **Listar PRs abiertas:** Ejecuta `gh pr list --state open`.
2. **Inspeccionar el PR a fondo:**
   - Ejecuta `gh pr view <numero>` y `gh pr diff <numero>`.
   - Cruza los cambios del PR contra los archivos reales del proyecto (`docs/CONTEXTO_IA_EQUIPO.md`, `backend/prisma/schema.prisma`, `docs/api-contract.md`, `docs/FORMA_Documentacion_Proyecto_v0.3.docx`, `frontend/src/types/`).
3. **Auditar los 5 puntos críticos:**
   - **A. Fronteras del Monorepo:** ¿El autor modificó únicamente las carpetas que le corresponden según su rol o tocó archivos ajenos por accidente?
   - **B. Seguridad y Limpieza:** ¿Incluye archivos `.env`, secretos, tokens, `node_modules/`, `dist/` o archivos basura?
   - **C. Consistencia de Nombres y Tipos (Anti-incongruencias):** ¿Los nombres de entidades, campos JSON, estados (`estado_pedido`, `estado_pago`), roles (`ADMIN`, `SUPERVISOR`, `VENDEDOR`, `PREPARADOR`) y rutas coinciden letra por letra con `schema.prisma` y la v0.3?
   - **D. Candados de Negocio (RF-02, RF-05, RF-07, RF-11, RF-12, RF-13):**
     - ¿El cálculo de precios final se mantiene en el backend (`priceCalculator.ts`)?
     - ¿Se respetan `estado_pedido` y `estado_pago` como campos independientes?
     - ¿Se guardan snapshots inmutables en `OrderItem` y `OrderDiscount`?
     - ¿Se protegen rutas privadas con `requireRole([...])`?
   - **E. Compilación y Sintaxis:** ¿Hay errores de sintaxis, tipos de TypeScript rotos o enlaces/formatos rotos?
4. **Entregar Diagnóstico al Líder en el Chat:**
   - **Estado del PR:** `✅ Listo para que lo apruebes` o `⚠️ Con errores / incongruencias detectadas`.
   - **Hallazgos detallados:** Lista exacta de archivo, línea y motivo técnico del problema.
   - **Borrador del comentario para GitHub:** El texto exacto y constructivo que se le enviaría al compañero explicando qué debe corregir y cómo hacerlo.
   - **Pregunta de control:** *«¿Quieres que publique este comentario en el PR #N en GitHub o deseas ajustar algo?»*

---

### Paso 2: Publicación del Comentario en GitHub (Solo tras confirmación del Líder)
Únicamente cuando el líder responda autorizando el envío:
- Si el PR **tiene problemas o incongruencias**:
  Ejecuta `gh pr comment <numero> --body-file <archivo>` (o `gh pr review <numero> --request-changes --body-file <archivo>` si es de otro autor) con el motivo detallado y los pasos para corregirlo.
- Si el PR **está correcto** y el líder pide dejar constancia de revisión técnica:
  Ejecuta `gh pr comment <numero> --body-file <archivo>` dejando el visto bueno técnico y el checklist para QA (Thomas), recordándole al líder que el botón de **Merge** queda listo para él.
- Verifica que el comentario se haya publicado y devuelve el enlace real.
