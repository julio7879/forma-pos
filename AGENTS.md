# FORMA — reglas permanentes del agente

- Sigue la skill `forma-github-workflow` para Issues, ramas, commits y Pull Requests.
- Usa las skills del proyecto en `.agents/skills/`:
  - `forma-gestor-evidencia` para crear/cerrar tareas y registrar evidencias en `docs/EVIDENCIA_JURADO.md`.
  - `forma-sincronizador-api` para mantener sincronizados `docs/api-contract.md`, `frontend/src/types/` y Prisma.
  - `forma-auditor-pr` para auditar Pull Requests y verificar los candados de negocio antes del merge.
  - `forma-panel-expertos-avanzado` para evaluar decisiones estratégicas, dilemas de alcance o bloqueos técnicos con el comité de 5 expertos.
  - `forma-evaluador-progreso` para medir el avance real frente a la entrega del 31 de octubre y el cumplimiento de RF-01 a RF-19.
  - `forma-puente-supabase-mocks` para configurar Supabase + Prisma, generar `seed.ts` y datos mock idénticos para el frontend.
  - `forma-prompts-equipo` para generar prompts blindados de WhatsApp/Discord para que ChatGPT, Claude y Gemini de los compañeros no inventen campos ni negocios ajenos.
- **REGLA OBLIGATORIA DE PUBLICACIÓN:** Pregunta SIEMPRE al líder antes de subir cualquier archivo o cambio a GitHub (`git push`, crear Issues, abrir PRs o comentar). Todo cambio se prepara primero localmente.
- Respeta siempre el contrato técnico y las 10 entidades definidas en `docs/CONTEXTO_IA_EQUIPO.md` y `backend/prisma/schema.prisma`.
- `main` y `develop` son ramas compartidas protegidas: no hagas commits directos ni merges.
- El líder decide cuándo integrar cambios. No fusiones PRs.
- Inspecciona estado y diff antes de cambiar de rama, hacer commits o publicar.
- No descartes cambios del usuario ni ejecutes comandos destructivos sin autorización.
- No publiques secretos ni archivos `.env`.
- Verifica con herramientas reales cualquier Issue, rama, commit, PR o prueba que reportes.
- Si GitHub CLI o la autenticación no están disponibles, explica el bloqueo; no inventes acceso.
