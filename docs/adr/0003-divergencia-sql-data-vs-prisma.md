# ADR-0003 · Divergencia entre la propuesta SQL de Data y el modelo Prisma MVP

- Fecha: 2026-06-02
- Estado: aceptada (pendiente de reconciliación)

## Contexto

Data Science aportó una propuesta de esquema SQL ([../data/BBDD.sql](../data/BBDD.sql),
documentada en [../data/README.md](../data/README.md)) con entidades en español
(`usuarios`, `familias`, `comercios`, `eventos`, `favoritos`, `ratings`) y `pgvector`.
El backend MVP usa un modelo Prisma propio en inglés (`Activity`, `Review`, `Incident`,
`Favorite`) alineado con el contrato `docs/api.md`.

## Decisión

- Para el MVP, la **fuente de verdad es el modelo Prisma + el contrato `docs/api.md`** (inglés).
- La propuesta SQL de Data se mantiene como **documento**, no como modelo ejecutable.
- No se adapta el backend al SQL en este ciclo.

## Consecuencias

- ✅ El MVP avanza sin bloquearse por la reconciliación de modelos.
- ⚠️ Divergencias a resolver antes de integrar: idioma, `eventos` vs `activities`,
  `ratings` (sobre comercios) vs `reviews` (sobre actividades), favoritos por familia vs
  por usuario mock, y `pgvector`.
- 🔒 Privacidad: `hijos.nombre` del SQL es dato sensible de un menor → revisar con
  Ciberseguridad antes de adoptarlo.
- ➡️ Próximo paso: reunión Full Stack + Data + Ciber para fijar la fuente de verdad y el mapeo.

Relacionado: [ADR-0001](0001-prisma-preparado-no-runtime.md), [../data/README.md](../data/README.md).
