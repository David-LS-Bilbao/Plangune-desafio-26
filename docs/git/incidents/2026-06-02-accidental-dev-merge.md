# Incidencia Git · Merge accidental de backend en `dev`

- **Fecha:** 2026-06-02
- **Tipo:** incidencia de flujo Git (rama de destino incorrecta en un PR)
- **Severidad:** media (sin pérdida de datos; historial recuperado mediante reverts)
- **Estado:** resuelta · con **riesgo futuro** documentado (ver más abajo)

---

## Resumen ejecutivo

La integración real de `events` (rama `feat/backend-real-events-prisma`) **debía** mergearse
contra `feature/backend`, pero el **PR #17 se mergeó por error contra `dev`**. Tras varios PRs de
corrección, el estado quedó saneado: **`feature/backend` conserva la integración** y **`dev` ya no
contiene esa integración prematura**.

Queda un **riesgo futuro conocido**: al integrar más adelante `feature/backend` en `dev`, un PR
normal podría salir **vacío** o no mostrar los cambios esperados, porque Git ya registró que esos
commits entraron en `dev` y fueron revertidos. La solución en ese momento será **revertir el revert**
(nunca `reset`/`rebase`/`force push`).

---

## Qué ocurrió (cronología)

| PR | Acción | Resultado |
|----|--------|-----------|
| **#17** | `feat/backend-real-events-prisma` mergeado **contra `dev`** (debía ser contra `feature/backend`). Merge commit `0c56eb45a4d5116919a3d36c78a1336adee013fe` | Integración de `events` entra en `dev` **por error** |
| **#18** | Sincronizar `feature/backend` con los cambios que habían entrado por error en `dev` | `feature/backend` recibe la integración de `events` (donde **sí** corresponde) |
| **#19** | Merge **sin cambios reales** (vacío) | No aporta contenido |
| **#20** | Revierte el PR #19, pero **no** retira los cambios reales de `dev` (porque #19 no tenía contenido) | `dev` sigue conteniendo `events` |
| **#21** | Revierte correctamente el merge commit del PR #17 (`0c56eb45…`). Merge commit del revert: `61e0895b009cdcb981f3c7f810e0cf1f118d7a58` | `dev` **vuelve a quedar sin** la integración prematura |

> Hashes clave:
> - Merge del PR #17 (accidental, ya revertido): `0c56eb45a4d5116919a3d36c78a1336adee013fe`
> - Merge del PR #21 (el revert correcto): `61e0895b009cdcb981f3c7f810e0cf1f118d7a58`

---

## Por qué fue un problema

- **`dev` es rama de integración global protegida**: según la política, solo recibe `frontend` y
  `backend` mediante PR e integración humana, y **no** antes de que ambos estén terminados e
  integrados entre sí. La entrada de `events` por #17 fue una **integración prematura** a `dev`.
- Saltarse el destino correcto (`feature/backend`) **desordena el historial** y obliga a una cadena
  de reverts.
- Los reverts dejan una **huella en el historial**: Git "recuerda" que esos commits ya entraron en
  `dev`, lo que puede hacer que un futuro merge legítimo **no muestre los cambios** (problema clásico
  del *revert de un merge*).

---

## Cómo se corrigió

1. **#18** llevó la integración a `feature/backend` (su sitio correcto).
2. **#21** revirtió el merge del PR #17 en `dev`, dejando `dev` limpio de la integración prematura.
3. (#19 y #20 fueron ruido intermedio: un merge vacío y su revert, sin efecto sobre el contenido.)

Todo se hizo **avanzando el historial con reverts** (commits nuevos), **sin** reescribir historia
compartida.

---

## Estado final de ramas

| Rama | Estado |
|------|--------|
| `feature/backend` | ✅ Conserva la integración backend real de `events`. |
| `dev` | ✅ Sin la integración prematura de `events` (revertida por #21). |
| `main` | Sin cambios (no afectada por la incidencia). |

---

## Riesgo futuro

Cuando llegue el momento de **integrar `feature/backend` en `dev`** (a su debido tiempo, con todo
listo), un PR normal puede:

- salir **vacío**, o
- **no mostrar** los cambios de `events` esperados,

porque Git ya registró que esos commits entraron en `dev` (vía #17) y fueron revertidos (vía #21).
Es el comportamiento esperado al revertir un merge: para reintroducir el contenido hay que
**revertir el revert**, no volver a mergear sin más.

---

## Procedimiento recomendado al integrar `feature/backend` en `dev`

1. Abrir el PR `feature/backend → dev` **como siempre** y revisar el diff.
2. **Si el diff es completo** (muestra los cambios de `events`): mergear con revisión humana. Fin.
3. **Si el diff sale vacío o incompleto** (por el revert previo del PR #21):
   - Reconocer que es el caso *"revertir el revert"*.
   - Crear una rama de trabajo desde `dev` y **revertir el merge del revert (PR #21, `61e0895…`)**,
     de modo que esos commits vuelvan a ser integrables.
   - Verificar el diff resultante, abrir PR hacia `dev` y mergear **con revisión humana**.
   - Confirmar después que `dev` contiene la integración esperada y que `feature/backend` sigue intacta.

> Decidir entre la opción 2 y la 3 **mirando el diff real del PR** en el momento de integrar; no
> anticipar comandos a ciegas.

---

## Comandos orientativos (NO ejecutar aquí)

Solo de referencia para el momento de la integración. **No se ejecutan en esta tarea de
documentación.** Verificar siempre el `-m <parent>` correcto sobre el merge real.

```bash
# 1) Intentar la integración normal y MIRAR el diff
git switch dev && git pull
# abrir PR feature/backend -> dev y revisar

# 2) Solo SI el PR sale vacío/incompleto: revertir el revert del PR #21
git switch dev && git pull
git switch -c chore/reintegrate-events-into-dev
git revert -m 1 61e0895b009cdcb981f3c7f810e0cf1f118d7a58   # revierte el revert (PR #21)
#   (alternativa: revertir el commit de revert concreto contenido en el PR #21)
git status --short && git diff --name-only                  # revisar antes de proponer commit
# abrir PR chore/reintegrate-events-into-dev -> dev y mergear con revisión humana
```

> El `-m 1` selecciona el primer padre del merge; **confírmalo** con `git show 61e0895…` antes de
> usarlo, porque el padre correcto depende de cómo se creó ese merge.

---

## ⚠️ Nota explícita

**No usar `git reset`, `git rebase` ni `git push --force`** (ni `--force-with-lease`) sobre `dev`,
`feature/backend` ni `main` para "arreglar" esto. Reescribir historia compartida rompería los clones
del resto del equipo. La vía correcta es **siempre avanzar con `git revert`** (commits nuevos) y PRs
con revisión humana.

---

## Referencias

- Política de ramas: [../../ai/GIT_BRANCHING_POLICY.md](../../ai/GIT_BRANCHING_POLICY.md)
- Flujo Git seguro: [../../ai/skills/SKILL_GIT_SAFE_WORKFLOW.md](../../ai/skills/SKILL_GIT_SAFE_WORKFLOW.md)
- Feature integrada: [../../features/backend-real-events-prisma.md](../../features/backend-real-events-prisma.md)
- Git howto oficial: *"How to revert a faulty merge"* (`git help revert` / Documentation/howto).
