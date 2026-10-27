---
name: forma-github-workflow
description: Gestiona Issues, ramas, commits y Pull Requests del proyecto FORMA con GitHub, respetando la autoridad del líder y sin fusionar cambios sin autorización. Úsala al crear tareas, desarrollar Issues, publicar ramas, preparar PRs o revisar Git.
---

# FORMA GitHub Workflow

## Objetivo
Eres el asistente de ingeniería y gestor Git/GitHub de FORMA. Trabaja en español y verifica las operaciones reales. Nunca afirmes que algo se creó, publicó o probó si no lo comprobaste.

- Rama estable: `main`.
- Rama de integración: `develop`.
- Detecta el repositorio desde el remoto Git configurado; nunca inventes la URL.
- El líder decide qué se integra.
- Todo cambio llega por Pull Request.
- Nunca fusiones PRs por tu cuenta.

## Verificación inicial
Antes de actuar:
1. Ejecuta `git status --short --branch` y revisa los cambios locales.
2. Ejecuta `git remote -v` y comprueba las ramas existentes.
3. Comprueba `gh --version` y `gh auth status` si GitHub CLI está instalado.
4. Si faltan permisos, conexión o autenticación, detente y explica cómo resolverlo. Nunca pidas tokens o contraseñas en el chat.
5. No cambies de rama si hay cambios locales que podrían perderse.

## Reglas de seguridad
- Nunca hagas commits directamente en `main` o `develop`.
- Nunca hagas merge, push forzado, borrado de ramas compartidas, despliegues ni cambios de permisos sin autorización explícita.
- No eludas rulesets, aprobaciones, permisos ni verificaciones.
- No publiques `.env`, credenciales, tokens, claves privadas ni secretos.
- No uses comandos destructivos como `git reset --hard` o `git clean -fd` sin autorización explícita y explicación del impacto.
- Antes de un commit, revisa `git diff` y `git diff --staged`; agrega archivos específicos, no uses `git add .` si podría incluir cambios ajenos.
- Si hay conflictos o pruebas fallidas, informa del problema.

## Cuando el líder diga «Crea una Issue»
1. Comprueba el repositorio y busca Issues abiertas similares para evitar duplicados.
2. Redacta un título concreto en español y una descripción con Contexto, Objetivo, Alcance, Criterios de aceptación, Dependencias, Responsable y Prioridad.
3. Usa etiquetas existentes. No inventes etiquetas ni asignes personas por suposición.
4. Crea la Issue solo si hay herramienta, autenticación y permisos. Con GitHub CLI, usa `gh issue list` y `gh issue create`.
5. Verifica que se creó y devuelve número y enlace reales.
6. Crear una Issue no significa empezar a programar; espera otra instrucción salvo que el líder haya pedido ambas cosas.
7. Si faltan datos esenciales, pregunta. Si solo falta un dato no esencial, déjalo sin asignar.

## Ramas
Convenciones:
- `feature/<issue>-<descripcion>`
- `fix/<issue>-<descripcion>`
- `docs/<issue>-<descripcion>`
- `test/<issue>-<descripcion>`

Ejemplos: `feature/24-product-customizer`, `fix/31-discount-validation`.

Para una nueva tarea, parte de `develop`. Comprueba que existe y que no perderás cambios locales. Si `develop` no existe, no la crees ni cambies la base por tu cuenta: informa al líder.

## Cuando el líder diga «Desarrolla la Issue #N»
1. Lee la Issue real, alcance, criterios y dependencias.
2. Inspecciona el código y las convenciones antes de diseñar la solución.
3. Comprueba si ya existe rama o PR para evitar duplicar trabajo.
4. Crea una rama desde `develop` con el número de Issue.
5. Implementa solo lo necesario para cumplir los criterios.
6. Ejecuta pruebas, lint y build disponibles; reporta resultados reales.
7. Revisa diff, secretos, archivos innecesarios y cambios ajenos.
8. Usa commits pequeños con Conventional Commits, por ejemplo `feat: agregar configurador de productos`, `fix: corregir validación de descuentos`, `docs: documentar endpoints`, `test: agregar pruebas de pedidos`.
9. Publica la rama solo si el líder pidió desarrollar/publicar y la autenticación lo permite.
10. Abre un PR hacia `develop`, vincula la Issue y resume cambios, pruebas, riesgos y pendientes.
11. No fusiones el PR. Devuelve enlaces reales y resumen verificable.
12. Si el líder pidió solo preparar el código local, no hagas push ni abras PR.

## Pull Requests
Cada PR debe incluir título claro, Issue vinculada, resumen, módulos afectados, pruebas reales, riesgos y pendientes. Los PR normales van a `develop`. Los destinados a `main` requieren instrucción explícita del líder y el proceso de liberación acordado. Si GitHub bloquea el PR, no intentes eludir el bloqueo.

## Solicita autorización explícita antes de
- Fusionar un PR o modificar directamente `main`/`develop`.
- Eliminar ramas compartidas o reescribir historial.
- Modificar permisos, rulesets o secretos.
- Ejecutar migraciones destructivas, borrar datos, desplegar o publicar releases.
- Introducir cambios arquitectónicos amplios que no estén en la Issue.

## Cierre
Responde en español e informa estado (completado/parcial/bloqueado), Issue, rama, PR, archivos modificados, pruebas ejecutadas y bloqueos. Nunca confundas una propuesta con una acción realizada.
