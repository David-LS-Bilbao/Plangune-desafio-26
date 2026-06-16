# Feature · GUNI integrado en el planificador familiar

Rama: `feat/predev-guni-planner-integration` (hija de `test/integration-frontend-backend-20260605`, pre-dev).

Lleva GUNI del playground dev (`/dev/family-chat`) al **flujo real de familia**: un panel
**"Pregunta a GUNI"** dentro de `/buscar`, donde una familia escribe su necesidad y recibe una
respuesta amable con recomendaciones.

## Endpoint usado
`POST /api/assistant/family-plan` (Express; fachada única). El frontend **nunca** llama a
Data/Flask/Ollama/DeepSeek. El asistente puede responder en modo IA o en *fallback* local; la UI
distingue por `mode` y **no muestra `source`/`mode` en crudo**.

## Pantalla afectada
- **`/buscar`** ([PlansSearch.jsx](../../frontend/src/pages/PlansSearch.jsx)): nuevo bloque
  **"Pregunta a GUNI"** sobre las recomendaciones. El `familyProfile` se deriva de los filtros que
  ya usa el usuario (municipio, edades, carrito→`strollerFriendly`, interior→`rainSuitable`,
  gratis→`budget:0`) y se envía como contexto.
- **`/dev/family-chat`**: el playground **no se toca** y sigue funcionando.

## Arquitectura añadida (reutilización)
- `frontend/src/services/assistantApi.js` — `sendFamilyPlan({ message, familyProfile })` sobre
  `apiClient` (coherente con el resto de servicios; el playground conserva su `familyChatApi`).
- `frontend/src/components/assistant/GuniPanel.jsx` (+ `guni-panel.css`) — panel mobile-first con
  input, chips de ejemplo y estados. **Reutiliza** la mascota `GuniMascot` del playground (con
  tamaño propio), el mapper `recommendationsToCards` y la tarjeta `RecommendationCard`.
- `frontend/src/components/recommendations/RecommendationCard.jsx` — tarjeta **extraída** del bloque
  de recomendaciones para compartirla entre `RecommendedPlans` y `GuniPanel` (sin duplicar lógica).

## Comportamiento por estado
- **idle:** intro + chips de ejemplo + input.
- **loading:** spinner "GUNI está pensando un plan...".
- **respuesta (modo IA):** muestra `assistantMessageMarkdown` como texto legible (se preservan saltos
  de línea; no se renderiza Markdown enriquecido) + recomendaciones si llegan.
- **respuesta (fallback):** muestra `message` con una nota amable **"Orientación básica disponible
  ahora"** (nunca la palabra `fallback` ni `source`).
- **empty:** si no llegan recomendaciones, se muestra solo el texto (no es error).
- **error:** mensaje amable ("Inténtalo de nuevo en un momento"), sin romper `/buscar`.

Las recomendaciones se pintan con `RecommendationCard`: **enlace a detalle y favorito solo si hay
`id` válido** (las recomendaciones de Data sin id interno no enlazan ni se favoritan).

## Qué NO hace esta feature
- No chat en tiempo real (es petición/respuesta puntual).
- No toca backend, GUNI playground, DeepSeek, pagos ni reservas.
- No renderiza Markdown enriquecido (texto plano con saltos de línea).
- No persiste el historial de conversación.

## Cómo probar manualmente (backend vivo + DB con seed)
1. Abrir **http://localhost:5173/buscar**.
2. Ver el bloque **"Pregunta a GUNI"**.
3. Enviar: *"Plan cubierto en Bilbao para bebé con carrito"* (o usar un chip de ejemplo).
4. Ver respuesta amable; si el backend devuelve recomendaciones, aparecen como tarjetas con "Ver plan".
5. Confirmar que **no** se muestran `source`/`mode` en crudo.
6. Confirmar que **`/dev/family-chat` sigue funcionando**.
7. En Network: solo `POST http://localhost:3000/api/assistant/family-plan`. Sin errores de consola.

## Tests
- `assistantApi.test.js` (2): POST correcto + `familyProfile` por defecto.
- `GuniPanel.test.jsx` (5): idle, modo IA con recomendación + CTA (sin `source` crudo), fallback amable,
  recomendación sin id (sin "Ver plan"), error amable.
- `npm run test:frontend` → **44/44**. `npm run build --workspace frontend` → OK.

## Riesgos / pendientes
- Sin auth: el contexto familiar viaja por petición; no hay perfil persistido.
- Requiere backend vivo; si el asistente IA está caído, el backend responde en *fallback* y el panel
  lo muestra amablemente.
- `GuniMascot` se reutiliza con sizing propio; si el playground cambia sus clases `fcp-*`, revisar el
  CSS del panel.
