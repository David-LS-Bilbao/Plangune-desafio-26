# Estado del proyecto · DESAFIO-26 — 2026-06-07

> Auditoría **de solo lectura** (no se modificó código). Verificación estática del código + ejecución de
> tests/build. Contrastado contra el checklist "Implementado y debería estar funcionando en pre-dev".

- **Rama auditada:** `test/integration-frontend-backend-20260605` (`e826fbc`, PR #51),
  **sincronizada con origin** (sin ahead/behind), working tree limpio.
- **✅ Estado git resuelto:** el merge con `origin/feature/frontend` (antes en curso) se **cerró e integró**
  vía PR #51 desde `test/predev-sync-feature-frontend-final` (rama remota ya borrada/prune). Los 2 archivos
  que estuvieron en conflicto — [PlanDetail.jsx](../../frontend/src/pages/PlanDetail.jsx) y
  [PlansSearch.jsx](../../frontend/src/pages/PlansSearch.jsx) — quedaron resueltos y commiteados.
  `MERGE_HEAD` ya no existe; `git diff --check` OK.

> *Nota histórica:* la primera pasada de esta auditoría detectó un merge a medias (`MERGE_HEAD` → `708dc3e`,
> PR #50) con esos 2 archivos resueltos en disco pero sin `git add`/`commit`. Se confirmó cerrado el 2026-06-07.

**Leyenda:** ✅ implementado y verificado · 🟡 implementado como demo/mock (intencional) · ⬜ pendiente · ⚠️ matiz.

---

## Resumen ejecutivo

| Bloque | Estado |
|---|---|
| `/planes` real (GET /api/events) | ✅ |
| `/buscar` real + filtros familiares | ✅ |
| `/planes/:id` real (GET /api/events/:id) | ✅ |
| `/favoritos` persistente (API) | ✅ |
| Recomendaciones (GET /api/recommendations) | ✅ |
| Normalización Data → contrato events | ✅ |
| GUNI en `/buscar` (POST /api/assistant/family-plan) | ✅ |
| Playground `/dev/family-chat` | ✅ |
| Login / roles | 🟡 mock |
| Admin / Negocio | 🟡 mock/demo |
| Reseñas / Incidencias en DB | ⬜ en memoria |
| Tests backend 115/115 · frontend 44/44 · build · diff --check | ✅ |
| Auth real / guards / perfil persistente / deploy | ⬜ |

---

## 1. Arranque y entorno

- ✅ `GET /api/health` → `{ status: "ok", service: "DESAFIO-26 API" }`
  ([health.controller.js](../../backend/src/controllers/health.controller.js)).
- ✅ Frontend consume **solo** `/api` vía `apiClient` (`baseURL = import.meta.env.VITE_API_URL`,
  [apiClient.js](../../frontend/src/services/apiClient.js)). Sin URLs internas hardcodeadas.
- ✅ `CLIENT_URL` configurable por env (`backend/.env.example`); backend en `:3000`, frontend `:5173/5174`.
- ⚠️ No verificable en esta auditoría estática: ausencia de errores rojos en consola del navegador y
  arranque en vivo (requiere levantar ambos servicios). El código no presenta llamadas fuera de `/api`.

## 2. Landing y navegación

- ✅ `/` → [Landing.jsx](../../frontend/src/pages/Landing.jsx); rutas registradas en
  [AppRoutes.jsx](../../frontend/src/routes/AppRoutes.jsx) (familia, negocio, admin, login).
- ✅ Navbar responsive ([NavbarResponsive.jsx](../../frontend/src/components/common/NavbarResponsive.jsx)).
- ⚠️ Revisión visual mobile-first y CTAs en vivo: pendiente de validación humana (no automatizable aquí).

## 3. Login / roles mock

- 🟡 `/login` carga ([Login.jsx](../../frontend/src/pages/Login.jsx),
  [LoginForm.jsx](../../frontend/src/components/auth/LoginForm.jsx)).
- 🟡 Login **mock**: detecta rol por email contra `MOCK_USERS` (family / business / admin) y guarda en
  `localStorage` vía `useAuthStore`. No bloquea el flujo de familia.
- ⬜ **Pendiente real:** Auth con JWT/sesión · Guards por rol (no hay protección de rutas).

## 4. Planes reales (`/planes`)

- ✅ [PlansList.jsx](../../frontend/src/pages/PlansList.jsx) carga vía `fetchEvents()`
  ([eventsApi.js](../../frontend/src/services/eventsApi.js)) → `GET /api/events`.
- ✅ Estados **loading** (spinner), **error** amable con "Reintentar", y **empty** ("Aún no hay planes").
- ✅ No depende de `mockPlans`: usa datos reales mapeados con `eventsToPlans`.

## 5. Buscador / planificador (`/buscar`)

- ✅ [PlansSearch.jsx](../../frontend/src/pages/PlansSearch.jsx) usa `fetchEvents(buildFilters())` con
  debounce y protección de carrera (`requestIdRef`). No usa el store mock.
- ✅ Filtros que llegan a `GET /api/events`: **municipio** (`municipio`), **territorio** (`territorio`),
  **edad** (`edad`), **carrito** (`es_carrito`), **cambiador** (`es_cambiador`),
  **interior** (`es_interior`), **silla de ruedas** (`es_silla_ruedas`), **mascotas** (`es_mascotas`).
- ⚠️ "Gratis" se filtra **en cliente** por precio (no hay filtro de precio en `/api/events`); "Tranquilo"
  está marcado como `prepared` (sin dato en backend, no rompe UI). Documentado en el propio componente.

## 6. Ficha enriquecida (`/planes/:id`)

- ✅ [PlanDetail.jsx](../../frontend/src/pages/PlanDetail.jsx) usa `fetchEventById(id)` → `GET /api/events/:id`.
- ✅ Muestra título, descripción, ubicación, edad, precio, categoría, fecha, y chips de servicios:
  carrito, cambiador, interior, silla de ruedas, mascotas (datos reales del evento).
- ✅ Distingue **404** (plan no existe) de **error** de red; ambos con UI amable.
- ✅ Permite **favorito** (`toggleFavorite`). ✅ **No hay botón "Reservar"** (solo favorito, mapa, reportar).
- ⚠️ "Reportar incidencia" muestra un mensaje local; **no** llama a la API de incidencias (ver punto 15).

## 7. Favoritos persistentes (`/favoritos`)

- ✅ [Favorites.jsx](../../frontend/src/pages/Favorites.jsx) +
  [FavoritesContext.jsx](../../frontend/src/context/FavoritesContext.jsx):
  `GET /api/favorites` al montar; toggle **optimista con rollback** (`POST`/`DELETE /api/favorites/:id`).
- ✅ Persistencia real en PostgreSQL → un **F5 no borra** favoritos (estado proviene del backend).
- ✅ Estado vacío claro. 🟡 Usuario family **mock fijo** en backend (sin auth todavía) — intencional.

## 8. Recomendaciones (`/buscar`)

- ✅ [RecommendedPlans.jsx](../../frontend/src/components/recommendations/RecommendedPlans.jsx) consume
  `GET /api/recommendations` ([recommendationsApi.js](../../frontend/src/services/recommendationsApi.js))
  con contexto derivado de los filtros.
- ✅ **Aislado**: su loading/error/empty **no rompe `/buscar`** (fallo → aviso discreto).
- ✅ Muestra `reasons` (explicabilidad). ✅ CTA a detalle **solo si hay `id`**; sin id → sin CTA roto.
- ✅ No muestra `source`/`mode` en crudo.

## 9. Normalización de recomendaciones Data

- ✅ Backend normaliza el plan crudo de Data al shape `events`:
  [normalizeDataEvent.js](../../backend/src/utils/normalizeDataEvent.js) +
  [recommendation.service.js](../../backend/src/services/recommendation.service.js).
- ✅ `event.title` / `description` / `address`, booleanos reales (`"True"/"False"` → boolean),
  `edad_minima` numérico o `null`, `id` puede ser `null` si no hay evento interno.
- ✅ `activity` es **alias** del mismo objeto `event` (compatibilidad legacy).
- ✅ Cubierto por tests: `normalizeDataEvent.test.js` (14) + `recommendations.test.js` (25).

## 10. GUNI integrado en `/buscar`

- ✅ [GuniPanel.jsx](../../frontend/src/components/assistant/GuniPanel.jsx) → `sendFamilyPlan()`
  ([assistantApi.js](../../frontend/src/services/assistantApi.js)) → `POST /api/assistant/family-plan`.
- ✅ Respuesta amable; recomendaciones si llegan (`RecommendationCard`); estado **fallback** mostrado como
  "Orientación básica disponible ahora 👇". ✅ Nunca muestra `source`/`mode` crudos.
- ✅ Error aislado: no rompe la búsqueda. ✅ Frontend **nunca** llama a Data/Ollama/DeepSeek (solo Express).

## 11. Playground GUNI dev (`/dev/family-chat`)

- ✅ Registrado **solo en dev** (`import.meta.env.DEV` en
  [AppRoutes.jsx:50](../../frontend/src/routes/AppRoutes.jsx#L50)); en build de producción se elimina.
- ✅ Usa el mismo endpoint Express con fallback amable; conserva su propio `familyChatApi`. Sigue intacto
  tras integrar GUNI en `/buscar` (no comparte estado).

## 12. Admin (`/admin`, `/admin/data`)

- 🟡 [AdminDashboard.jsx](../../frontend/src/pages/AdminDashboard.jsx) y
  [AdminData.jsx](../../frontend/src/pages/AdminData.jsx) cargan con **KPIs/datos demo hardcodeados**.
- ✅ Navegación apunta a **`/admin/data`** (no `/admin/datos`) en
  [NavbarResponsive.jsx](../../frontend/src/components/common/NavbarResponsive.jsx).
- ⬜ **Pendiente:** guard real de admin · moderación real · métricas reales.

## 13. Negocio / ofertas (`/negocio`, `/negocio/ofertas`, `/negocio/suscripciones`)

- 🟡 Dashboard, ofertas y suscripciones cargan desde `useBusinessStore` (mock en
  [store/index.js](../../frontend/src/store/index.js), datos de `mockPlans`). Sin pagos reales.
- ✅ No rompe la navegación principal.
- ⬜ **Pendiente:** API real de negocio/ofertas · moderación admin real.

## 14. Tests y build — **TODO EN VERDE** (ejecutado 2026-06-07)

| Comprobación | Resultado |
|---|---|
| `npm run test:backend` | ✅ **115/115** (12 suites) |
| `npm run test:frontend` | ✅ **44/44** (9 suites) |
| `npm run build --workspace frontend` | ✅ OK (151 módulos, build en ~1.6s) |
| `git diff --check` | ✅ OK (sin conflictos residuales / whitespace) |

**Warnings conocidos no bloqueantes (confirmados):** React Router future flags (`v7_startTransition`,
`v7_relativeSplatPath`) y `window.scrollTo` no implementado en jsdom.

## 15. Pendiente para el MVP final

- ⬜ **Reseñas reales en DB** — hoy almacén **en memoria** ([review.service.js](../../backend/src/services/review.service.js), se reinicia con el proceso).
- ⬜ **Incidencias reales en DB** — hoy almacén **en memoria** ([incident.service.js](../../backend/src/services/incident.service.js)); el botón "Reportar" del detalle no llama a la API.
- ⬜ **Auth real (JWT/sesión)** y **guards por rol** (rutas admin/negocio sin protección).
- ⬜ **Perfil familiar persistente** — hoy en `useUserStore` (mock, no persiste en backend).
- ⬜ **Negocios/ofertas reales** en API/DB + moderación admin.
- ⬜ **Fallback cloud del asistente** (DeepSeek/Gemini) — rama `feat/backend-assistant-cloud-fallback`
  existe pero **vacía** (idéntica a `feature/backend`). Ver
  [auditoría previa de assistant + cloud fallback].
- ⬜ **Hardening de seguridad final** y **deploy estable** (VPS 8 GB).
- ⬜ **Revisión visual humana mobile-first** completa.

---

## Notas de seguridad (rápidas)

- ✅ Sin secretos commiteados; `.env` ignorado (`!.env.example` permitido). `backend/.env` no trackeado.
- ✅ Frontend sin URLs internas (`5000/5001/5434/11434`), sin API keys, sin Ollama/DeepSeek/Gemini.
- ✅ Errores de backend enmascarados ([error.middleware.js](../../backend/src/middlewares/error.middleware.js));
  el assistant captura fallos y cae a fallback sin filtrar detalles internos.

## Siguientes pasos recomendados (orden sugerido)

1. ~~Cerrar el merge en curso del sandbox~~ → **HECHO** (PR #51, working tree limpio).
2. **Decidir promoción real** de la integración (`test/integration-frontend-backend-20260605`) hacia
   `dev`/`feature/frontend` por la vía oficial de PR.
3. **MVP funcional mínimo:** guards de rol mínimos (aunque sea sobre el mock) para no exponer admin/negocio.
4. **Persistencia de reseñas/incidencias** en DB (Prisma) — ya hay rutas/servicios, falta capa de repositorio.
5. **Perfil familiar persistente** (depende de auth real).
6. **Fallback cloud del asistente** en `feat/backend-assistant-cloud-fallback` (módulo aislado, sin tocar
   contrato público) — recomendado Gemini para MVP.
7. **Hardening + deploy** del VPS; revisión visual mobile-first final.

---

*Generado por auditoría asistida (solo lectura). No se modificó código de feature. Tests y build ejecutados
localmente el 2026-06-07.*
