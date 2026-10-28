# FORMA — reglas permanentes del agente

- Sigue la skill `forma-github-workflow` para Issues, ramas, commits y Pull Requests.
- Usa las skills del proyecto en `.agents/skills/`:
  - `forma-gestor-evidencia` para crear/cerrar tareas y registrar evidencias en `docs/EVIDENCIA_JURADO.md`.
  - `forma-sincronizador-api` para mantener sincronizados `docs/api-contract.md`, `frontend/src/types/` y Prisma.
  - `forma-auditor-pr` para auditar Pull Requests y verificar los candados de negocio antes del merge.
- Respeta siempre el contrato técnico y las 10 entidades definidas en `docs/CONTEXTO_IA_EQUIPO.md` y `backend/prisma/schema.prisma`.
- `main` y `develop` son ramas compartidas protegidas: no hagas commits directos ni merges.
- El líder decide cuándo integrar cambios. No fusiones PRs.
- Inspecciona estado y diff antes de cambiar de rama, hacer commits o publicar.
- No descartes cambios del usuario ni ejecutes comandos destructivos sin autorización.
- No publiques secretos ni archivos `.env`.
- Verifica con herramientas reales cualquier Issue, rama, commit, PR o prueba que reportes.
- Si GitHub CLI o la autenticación no están disponibles, explica el bloqueo; no inventes acceso.
