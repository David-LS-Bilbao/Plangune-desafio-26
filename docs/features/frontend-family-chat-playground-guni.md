# Feature · Playground del chat familiar GUNI

- **Fecha:** 2026-06-06
- **Rama origen:** `feat/frontend-family-chat-playground` (frontend)
- **Integrada en:** `test/integration-frontend-backend-20260605` (sandbox backend + frontend + GUNI)
- **Estado:** implementada · frontend 8/8 verdes (2 App + 6 playground) · build OK · runtime OK en `mode:"fallback"` · pendiente de decisión de PR

> **Nombre técnico estable:** DESAFIO-26. App provisional: *Plangune / TxikiPlan Euskadi* (lo define Marketing).

---

## Qué es

**GUNI** es el asistente familiar conversacional: el usuario describe qué necesita y GUNI propone
un plan familiar cómodo. Esta entrega es un **playground visual aislado** (no flujo de producción),
montado en la ruta de desarrollo **`/dev/family-chat`**.

Es la **única parte del frontend que consume el backend real** (`POST /api/assistant/family-plan`).
El resto de la app (planes, login, favoritos, negocio, admin) sigue funcionando con datos mock en
[`frontend/src/store/index.js`](../../frontend/src/store/index.js) / [`frontend/src/mocks/data.js`](../../frontend/src/mocks/data.js).

---

## Ruta y protección

```jsx
{import.meta.env.DEV && (
  <Route path="/dev/family-chat" element={<FamilyChatPlayground />} />
)}
```

- La ruta **solo se registra en desarrollo** (`import.meta.env.DEV`). En el build de producción Vite
  elimina la rama por *dead-code elimination* → `/dev/family-chat` **no existe en producción**.
- Vive dentro del grupo `MainLayout`, pero el contenedor `.fcp` es `position: fixed; inset: 0`,
  así que ocupa toda la viewport (experiencia de pantalla completa tipo app de chat).

---

## Estructura

```txt
frontend/src/features/family-chat-playground/
├── index.js                              # export default FamilyChatPlayground
├── components/
│   ├── FamilyChatPlayground.jsx          # contenedor: estado, envío, render del hilo
│   ├── GuniMascot.jsx                    # mascota SVG (estados idle/thinking)
│   ├── ChatBubble.jsx                    # burbuja de mensaje (user/guni) + tag fallback
│   ├── QuickPromptChips.jsx              # chips de prompts rápidos
│   ├── RecommendationCard.jsx            # tarjeta de plan recomendado (tolerante a shape)
│   └── FamilyPreferencesDrawer.jsx       # drawer lateral de preferencias familiares
├── services/
│   └── familyChatApi.js                  # ÚNICA llamada a la API (POST /api/assistant/family-plan)
├── styles/
│   └── family-chat-playground.css        # CSS propio, namespaced con prefijo .fcp, mobile-first
└── __tests__/
    └── FamilyChatPlayground.test.jsx     # 6 tests (Vitest + Testing Library)
```

---

## Contrato con el backend

Cumple el [contrato Frontend ↔ Backend](../contracts/frontend-backend-api-contract.md)
para `POST /api/assistant/family-plan`.

### Request

```json
{
  "message": "Busco un plan tranquilo en Bilbao para una niña de 4 años",
  "familyProfile": {
    "childrenAges": [4],
    "municipality": "Bilbao",
    "strollerFriendly": true,
    "rainSuitable": true,
    "budget": null
  }
}
```

- URL siempre vía `import.meta.env.VITE_API_URL` (fallback `http://localhost:3000/api`).
  **Nunca** llama a Data/Flask/Ollama/Postgres directamente.
- `message` limitado a **500 caracteres** en el input (`maxLength`) — coincide con la validación del backend (422 si se supera).
- `prefsToFamilyProfile` mapea los rangos de edad del drawer a números
  (`"0-2 años" → 1`, `"3-5 años" → 4`, `"6-10 años" → 8`, `"11+" → 11`) y
  `"Gratis o bajo coste" → budget 0` (si no, `null`).

### Respuesta · modo IA (`mode: "ai"`)

Renderiza `assistantMessageMarkdown`.

### Respuesta · fallback (`mode: "fallback"`)

Renderiza `message` (texto plano) + `recommendations` (hasta 3, mismo shape que `/api/recommendations`).

### Reglas de UI respetadas

- Distingue por `mode`; prioriza `assistantMessageMarkdown` y cae a `message`.
- `recommendations` se trata con `Array.isArray(...) ? ... : []` (tolera `[]` en modo IA).
- **No muestra `source`/`mode` en crudo**: `mode:"fallback"` se traduce a un tag amable
  *"Modo orientación básica"* en la burbuja.
- Si el backend/IA falla o no conecta, muestra un mensaje amable y **no rompe**.

---

## UX / accesibilidad

- **Mobile-first**, CSS propio namespaced (`.fcp`), `@media (min-width: 768px)` para escritorio.
- Respeta `prefers-reduced-motion` (animaciones de la mascota desactivadas).
- Drawer con `role="dialog"` + `aria-modal`, hilo con `aria-live="polite"`, botones con `aria-label`,
  switches con `:focus-visible`.

---

## Cómo probar

### Tests (sin backend real)

```bash
npm run test --workspace frontend -- src/features/family-chat-playground
# → 1 suite · 6/6 verdes (el service está mockeado con vi.mock)
```

### Manual (requiere backend local)

```bash
npm run dev:backend          # API en http://localhost:3000
npm run dev --workspace frontend
# abrir http://localhost:5173/dev/family-chat
```

### Smoke runtime del endpoint

```bash
curl -X POST http://localhost:3000/api/assistant/family-plan \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan tranquilo en Bilbao","familyProfile":{"childrenAges":[4],"municipality":"Bilbao"}}'
# Con LLM deshabilitado → {"mode":"fallback","message":"...","recommendations":[...]}
```

---

## Validación ejecutada

```
npm run test:frontend                 → 8/8 verdes (App 2 + playground 6)
npm run build --workspace frontend    → OK (playground incluido en dev; excluido en prod)
npm run test:backend                  → 94/94 verdes
POST /api/assistant/family-plan       → 200, mode:"fallback" bien formado
  message > 500                       → 422 {error}
  JSON malformado                     → 400 {error}
  Sin fuga de errores internos ni URLs internas en el cliente
```

---

## Limitaciones / deuda conocida

- **Solo playground**: `/dev/family-chat` es ruta de desarrollo, no está integrada en el flujo real
  de la app ni en la navegación de producción.
- **Resto de la app sigue en mock**: solo GUNI consume el backend; planes/favoritos/negocio/admin usan
  `store` + `mocks/data.js`.
- **Modo IA no ejercitado en runtime**: requiere `LLM_ASSISTANT_ENABLED=true` + `ai-service`/chatbot Data
  levantados. Validado el camino `fallback`.
- **Warning `window.scrollTo` (jsdom)** en `App.test.jsx`: no rompe tests; pendiente de mock en el setup de Vitest.
- **`.vscode/launch.json`** se excluyó deliberadamente del merge de integración (config de IDE, no versionable).

---

## Siguiente paso recomendado

1. Decidir si GUNI pasa de playground a flujo real (entrada desde navegación, no solo `/dev/`).
2. Validar el camino `mode:"ai"` en runtime con el `ai-service`/chatbot Data activos.
3. Mockear `window.scrollTo` en el setup de Vitest para silenciar el warning.
4. Definir destino de la sandbox de integración y, si procede, PR siguiendo la
   [política de ramas](../ai/GIT_BRANCHING_POLICY.md) y el [checklist de PR](../ai/PR_REVIEW_CHECKLIST.md).

---

## Referencias

- [Contrato Frontend ↔ Backend](../contracts/frontend-backend-api-contract.md)
- [SKILL · Contrato Frontend ↔ Backend](../ai/skills/SKILL_FRONTEND_BACKEND_CONTRACT.md)
- [SKILL · React mobile-first](../ai/skills/SKILL_REACT_MOBILE_FIRST.md)
- [Contrato API (índice)](../api.md)
- [Integración IA/Ollama local](../integration-ai-ollama-local.md)
