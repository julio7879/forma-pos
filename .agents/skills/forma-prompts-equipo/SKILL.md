---
name: forma-prompts-equipo
description: Genera prompts cortos y blindados listos para enviar por WhatsApp o Discord a cada integrante (Sofía, Esneider, Duvan, Yeimer, Thomas) para que los peguen en ChatGPT, Claude o Gemini sin fugas de contexto.
---

# FORMA Generador de Prompts Blindados para el Equipo

## Objetivo
Como los integrantes del equipo usan ChatGPT, Claude y Gemini (muchas veces desde el navegador web sin leer el repositorio completo), esta skill genera un **bloque compacto de instrucciones** listo para copiar y pegar en WhatsApp/Discord cuando le asignes o corrijas una tarea a un compañero.

## Estructura Obligatoria del Prompt para el Compañero
Cada vez que el líder pida un prompt para **Sofía, Esneider, Duvan, Yeimer o Thomas**, genera un bloque listo para copiar que incluya:
1. **Contexto del Negocio (Anti-alucinaciones):**
   *"Estamos construyendo FORMA: una tienda web interactiva + POS para negocios de PRODUCTOS PERSONALIZADOS (camisetas, tazas, grabados láser, papelería creativa). NO es un restaurante."*
2. **Frontera de Carpetas del Integrante:**
   Indica exactamente qué archivo(s) debe crear o editar ese integrante y cuáles NO debe tocar.
3. **Nombres Exactos de Campos (Diccionario Prisma v0.3):**
   Inyecta únicamente los nombres de campos exactos de `schema.prisma` que necesita esa tarea (ej. `nombre`, `precio_base`, `valores_recargos`, `estado_pedido`, `estado_pago`, `nombre_snapshot`, `opciones_snapshot`).
4. **Candados de Negocio Aplicables:**
   - Precios calculados en backend: `(precio_base + extras) * cantidad - descuento`.
   - `estado_pedido` y `estado_pago` siempre separados.
   - Respuestas de API con formato `{ success: true, data }` / `{ success: false, error: { code, message } }`.
5. **Comandos Git Exactos hacia `develop`:**
   Los comandos listos para que el compañero suba su cambio a su rama y abra el PR hacia `develop`.
