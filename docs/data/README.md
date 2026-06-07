# Modelo de datos · DESAFIO-26

Esta carpeta contiene los esquemas SQL del proyecto.

---

## Diferencia entre los dos archivos SQL de esta carpeta

| Archivo | Qué es | ¿Guía la implementación? |
| --- | --- | --- |
| `schema-real/init.sql` | **SQL real de la base de datos del proyecto** (fuente de verdad actual) | ✅ **Sí** — `schema.prisma` debe ser su espejo |
| `BBDD.sql` | Propuesta histórica de Data Science (arquitectura normalizada, `pgvector`, entidades en español) | ❌ **No** — referencia histórica, no contrato activo |

> **Decisión vigente (ADR-0004):** `docs/data/schema-real/init.sql` es la fuente de verdad
> actual para backend y Prisma. `BBDD.sql` queda como documento histórico.
> Ver [../adr/0004-real-schema-source-of-truth.md](../adr/0004-real-schema-source-of-truth.md).

---

## `schema-real/init.sql` — Fuente de verdad actual

SQL real recibido del proyecto. Define las tablas reales:
`users`, `families`, `family_members`, `businesses`, `events`, `offers`,
`plans`, `plan_events`, `user_favorite_events`, `user_favorite_plans`,
`user_selected_recommendations`.

La entidad central es **`events`** (planes y actividades familiares en Euskadi).

`backend/prisma/schema.prisma` es el **espejo fiel** de este SQL (campos en snake_case,
`@@map` a cada tabla, `onDelete` respetado). Ver [../database.md](../database.md).

## Fuente de verdad ACTUAL del backend

| Capa | Fuente de verdad | Ubicación |
| --- | --- | --- |
| Schema DB | SQL real | `docs/data/schema-real/init.sql` |
| Modelo Prisma | Espejo del SQL real (11 modelos) | `backend/prisma/schema.prisma` |
| Runtime | Services mock en memoria | `backend/src/services/`, `backend/src/seed/mockEvents.js` |
| Contrato API (events) | Endpoints REST documentados | [../api.md](../api.md) |

Endpoints principales: `/api/events`, `/api/events/:id`, `/api/recommendations`,
`/api/assistant/family-plan`, `/api/reviews`\*, `/api/incidents`\*, `/api/favorites`\*,
`/api/activities`\*.

> \* Estos endpoints del MVP previo siguen en runtime mock. Sus entidades
> (`Review`, `Incident`, `Favorite`, `Activity`) no existen en `init.sql` todavía;
> permanecen hasta decisión explícita del equipo (ver ADR-0004 §4).

---

## `BBDD.sql` — Propuesta histórica de Data Science

> ⚠️ **No ejecutar ni usar como base de Prisma.** Es referencia histórica.

Propuesta de arquitectura normalizada aportada por Data Science (esquema v5).
Difiere del `init.sql` real en estructura, idioma (español vs inglés en `init.sql`),
uso de `pgvector`, y entidades como `comercios`, `familias`, `hijos`, `ratings`.

### Riesgos que motivaron no adoptarlo directamente

1. **Idioma y naming**: entidades en español vs `init.sql` en inglés/mixto.
2. **Arquitectura diferente**: normalizada (`eventos` → `comercios` → `categorias`) vs plana (`events` en `init.sql`).
3. **`pgvector`**: requiere decisión técnica de infra y embeddings (Ollama/`nomic-embed-text`).
4. **🔒 Privacidad de menores**: `hijos.nombre TEXT NOT NULL` almacena el nombre de un menor — dato sensible. Revisar con Ciberseguridad antes de adoptar.

### Decisión

- Mantener como **referencia documental** en `docs/data/`.
- Cualquier alineación futura se decide con **Full Stack + Data Science + Ciberseguridad**.
