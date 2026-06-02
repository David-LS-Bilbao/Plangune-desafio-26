# ADR-0001 · PostgreSQL/Prisma preparado pero no runtime en el MVP

- Fecha: 2026-06-02
- Estado: aceptada

## Contexto

El backend MVP necesita servir actividades, recomendaciones, reseñas, incidencias y
favoritos para una demo. Montar PostgreSQL + Prisma como runtime real desde el inicio
añade dependencia de infraestructura (DB levantada, migraciones, generación de cliente)
que ralentiza la iteración y arriesga la demo.

## Decisión

- El runtime del backend usa **datos mock en memoria** (services en `backend/src/services/`, seed `backend/src/seed/mockActivities.js`).
- PostgreSQL + Prisma quedan **preparados pero no en runtime**: modelos MVP en `backend/prisma/schema.prisma` y seed en `backend/prisma/seed.js`.
- `backend/src/config/prisma.js` existe pero **no se importa en runtime** (no se instancia `PrismaClient` mientras los services sean mock).

## Consecuencias

- ✅ El backend arranca y los tests pasan **sin** DB, `prisma generate` ni migraciones.
- ✅ La demo no depende de infraestructura frágil.
- ⚠️ Hay que mantener alineados el shape del mock y el modelo Prisma para que la migración futura no rompa el contrato.
- ➡️ Migración futura: reimplementar los services sobre Prisma manteniendo **idénticas** las firmas y los shapes de respuesta del contrato (`docs/api.md`).

Relacionado: [ADR-0003](0003-divergencia-sql-data-vs-prisma.md), [../database.md](../database.md).
