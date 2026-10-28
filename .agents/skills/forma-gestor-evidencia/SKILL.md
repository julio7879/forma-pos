---
name: forma-gestor-evidencia
description: Genera Issues de GitHub con comandos Git adaptados hacia develop y registra automáticamente el bloque formal de evidencia para el jurado en docs/EVIDENCIA_JURADO.md. Úsala al iniciar o cerrar tareas de cualquier integrante.
---

# FORMA Gestor de Evidencia

## Objetivo
Estandarizar la creación y cierre de tareas para los 6 integrantes (Julio, Sofía, Esneider, Duvan, Yeimer, Thomas) y mantener actualizada la bitácora `docs/EVIDENCIA_JURADO.md` sin salir de GitHub.

## 1. Al iniciar una tarea (Generación de Issue + Comandos Git)
1. Verifica las fronteras del monorepo en `docs/CONTEXTO_IA_EQUIPO.md`.
2. Crea la Issue en GitHub con `gh issue create` asignando las etiquetas del área, prioridad (`Alta`, `Media`, `Baja`) y nombre del responsable.
3. Incluye siempre el bloque de comandos Git adaptado a la tarea:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<numero>-<slug>
   # Módulos a editar y comando de build
   git add <rutas-especificas>
   git commit -m "feat(<modulo>): <descripcion>"
   git push -u origin feature/<numero>-<slug>
   # Abrir PR hacia develop vinculando: Closes #<numero>
   ```

## 2. Al cerrar una tarea / integrar un PR (Registro para el Jurado)
1. Verifica que el PR haya sido validado y fusionado en `develop` por el líder.
2. Cierra la Issue en GitHub (`gh issue close <numero>`) si aún seguía abierta, referenciando el PR y commit de merge.
3. Agrega o actualiza en `docs/EVIDENCIA_JURADO.md` el bloque formal de evidencia:
   - **Issue y PR vinculados** (con enlaces reales).
   - **Responsable y Módulo.**
   - **Requisitos Funcionales (RF) cumplidos.**
   - **Evidencia técnica** (JSON de respuesta, validación de compilación o resultado de QA por Thomas).
