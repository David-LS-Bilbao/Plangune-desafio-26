# Integración del recomendador Data Science en Express

> Memoria técnica · DESAFIO-26 (*TxikiPlan Euskadi*, nombre provisional). Junio 2026.

## 1. Contexto

DESAFIO-26 es una web/app para **familias con bebés y niños pequeños en Euskadi**. Una de sus
piezas clave es el **sistema de recomendación de planes**. El equipo de **Data Science** desarrolla
ese motor como una **API Flask**, y el equipo **Full Stack** lo integra en el backend.

Decisión de arquitectura: el **frontend nunca llama a Flask directamente**. El flujo es siempre:

```
Frontend  →  Express (API pública)  →  Data Flask
```

Así el frontend tiene un único contrato estable (Express), y Data puede evolucionar por detrás.
Aunque la base de datos del backend usa ahora `events.es_interior` para representar planes
interiores o a cubierto, el contrato externo con Data mantiene el parámetro `lluvia` en
`GET /planes`.

## 2. Objetivo

Usar la **API Flask de Data como fuente principal** de recomendaciones, manteniendo el
**recomendador local** (reglado, sobre PostgreSQL/Prisma) como **fallback**. El objetivo doble es:
**aprovechar el modelo de Data** y, a la vez, **garantizar disponibilidad** aunque Data no esté
levantada o falle.

## 3. Arquitectura

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Controller | `recommendation.controller.js` | Parsea los filtros de la query string → `context` |
| Service | `recommendation.service.js` | Decide **Data primero / fallback local**; mapea y limita |
| Cliente Data | `dataRecommender.client.js` | Llama a Flask con `fetch` nativo de Node + timeout (`AbortController`) |
| Repositorio local | `event.repository.js` | Solo se usa en el **fallback local** (eventos reales de Prisma) |

```
GET /api/recommendations
  → controller (context)
    → service: ¿Data habilitado?
        ├─ sí → dataRecommender.client → GET {DATA_API_URL}/planes → source "data-api"
        └─ no / fallo → recomendador local (event.repository) → source "local-fallback"
```

## 4. Contrato con Data

**Endpoint:** `GET /planes`

**Parámetros enviados** (mapeo Express → Data):

| Express | Data |
|---|---|
| `municipality` | `ubicacion` |
| `childrenAges` | `edad_max` (= `min(childrenAges)`) |
| `rainSuitable` | `lluvia` |
| `strollerFriendly` | `carrito` |
| `changingTable` | `cambiador` |
| `wheelchairAccessible` | `silla_ruedas` |
| `petsAllowed` | `mascotas` |
| `includeKulturklik` | `kulturklik` |
| `limit` | `limite` |

**Respuesta aceptada** (formato principal):

```json
{ "total": 0, "filtros": {}, "resultados": [] }
```

También se acepta un **array directo** de planes, de forma defensiva. Si la respuesta no es
reconocible o no trae `resultados` válidos, se usa el fallback local.

El filtro público `rainSuitable` sigue expresando "plan interior/a cubierto cuando llueve".
Internamente el backend lo evalúa con `events.es_interior` en el fallback local, pero hacia Data
lo envía como `lluvia` para respetar el contrato acordado con Flask.

## 5. Contrato público de Express (estable)

Cada recomendación mantiene siempre el mismo shape:

```json
{
  "event": {},
  "activity": {},
  "score": 3,
  "reasons": ["..."],
  "source": "data-api"
}
```

- **`source`** distingue el origen: `"data-api"` o `"local-fallback"`.
- **`activity`** se mantiene como **alias legacy** de `event` (mismo objeto) para **no romper el
  frontend** actual mientras migra a la clave `event`.

## 6. Fallback

Express recurre al **recomendador local** cuando Data:
- está **deshabilitada** (`DATA_RECOMMENDER_ENABLED=false`),
- **falla** (error de red),
- **tarda demasiado** (timeout),
- devuelve **503** u otro error HTTP,
- devuelve una **respuesta inválida** o **sin resultados**.

El fallback conserva el **Family Score explicable** (score y razones reales) y marca los items con
`source: "local-fallback"`. Así el sistema **siempre responde algo útil**.

## 7. Variables de entorno

```bash
DATA_RECOMMENDER_ENABLED=false
DATA_API_URL=http://localhost:5000
DATA_API_TIMEOUT_MS=2000
```

`DATA_RECOMMENDER_ENABLED=false` por defecto porque **la API de Data aún no corre en local**
(pendiente de dockerizar). Con `true` y Data caída, cada petición esperaría el timeout antes de
caer al fallback; con `false` el backend usa directamente el recomendador local, más rápido en
desarrollo. Se activa con `true` cuando Data esté disponible.

## 8. Límite de resultados

- Por defecto Express devuelve **como máximo 3** recomendaciones, **también cuando Data responde OK**.
- Si llega el query param **`limit`**, se usa ese valor.
- A Data se le envía siempre `limite = limit ?? 3`, y tras mapear, Express aplica `slice(0, limit ?? 3)`
  por seguridad (aunque Data devuelva más).

## 9. Pruebas

Los tests **no dependen de Flask real ni de PostgreSQL real**: se mockean el cliente de Data y el
repositorio de eventos. Cubren:

- Data deshabilitado → fallback local.
- Data OK (array directo y `{ total, filtros, resultados }`) → `source: data-api`.
- Data timeout / error → fallback local.
- Data 503 → fallback local.
- Respuesta vacía / inválida → fallback local.
- Alias `event` / `activity` mantenido.
- Parseo de filtros (incluidos los nuevos) y su mapeo a Data.
- Límite por defecto (3) y `limit` personalizado.

**Resultado actual:**

```
npm run prisma:generate --workspace backend   → OK
npm run test:backend                           → OK · 10 suites · 67/67 tests verdes
```

## 10. Cambio de modelo de datos

Data solicitó sustituir el campo interno `events.es_lluvia` por `events.es_interior`, más claro
para representar planes interiores o a cubierto. Se implementa mediante una migración incremental
segura:

```sql
ALTER TABLE "events" RENAME COLUMN "es_lluvia" TO "es_interior";
```

La migración inicial no se modifica; las bases ya migradas conservan datos y solo renombran la
columna.

## 11. Limitaciones

- **Data aún no está dockerizada** en Compose (pendiente añadir el servicio `data-api`).
- **`budget` no se envía a Data** porque su API no tiene parámetro equivalente; solo lo usa el recomendador local.
- **Pendiente confirmar el shape final** de cada "plan" dentro de `resultados` (campos, si traen `score`/`reasons` propios).
- **Pendiente** que el frontend use `source` si quiere mostrar el origen de la recomendación.

## 12. Valor para el proyecto

Esta integración demuestra **coordinación real entre Full Stack, Data Science y Ciberseguridad**:
Express y Flask trabajan juntos a través de un contrato acordado, y Ciber aporta criterios de
revisión documental para futuras decisiones criptográficas. Además:

- **Mantiene un contrato estable para el frontend** (no se entera de si la recomendación viene de Data o del fallback).
- **Mejora la resiliencia**: el sistema sigue recomendando aunque Data esté caída.
- Deja el camino preparado para **encender Data** sin más cambios de frontend, solo activando una variable de entorno.

## Referencias

- Spec de integración: [../agents/data-recommender-primary-integration.md](../agents/data-recommender-primary-integration.md)
- Feature técnica: [../features/backend-data-recommender-primary.md](../features/backend-data-recommender-primary.md)
- Contrato API: [../api.md](../api.md)
