# Política de ramas Git · DESAFIO-26

Flujo Git **real y obligatorio** del equipo. Aplica a personas y a agentes de IA.
Si algún otro documento contradice este flujo, **manda este documento** (y por encima, [AGENTS.md](../../AGENTS.md)).

## Ramas permanentes (protegidas)

| Rama       | Propósito                                  | ¿Trabajo directo?                     |
| ---------- | ------------------------------------------ | ------------------------------------- |
| `main`     | Estable / final / demo                     | No (solo integración humana)          |
| `dev`      | Integración global                         | No (solo integración humana)          |
| `frontend` | Integración del equipo frontend            | No (solo integración humana)          |
| `backend`  | Integración del equipo backend             | No (solo integración humana)          |

**Ningún agente trabaja directamente en `main`, `dev`, `frontend` ni `backend`.**
Esas ramas solo se actualizan mediante integración humana controlada (PR + merge revisado por una persona).

## Ramas de trabajo (de dónde salen y a dónde vuelven)

| Tipo de cambio        | Sale de   | Vuelve a (PR) | Convención              |
| --------------------- | --------- | ------------- | ----------------------- |
| Feature/fix frontend  | `frontend`| `frontend`    | `feat/*`, `fix/*`       |
| Feature/fix backend   | `backend` | `backend`     | `feat/*`, `fix/*`       |
| Docs globales / IA    | `dev`     | `dev`         | `docs/*`                |
| Tests / chore globales| `dev`     | `dev`         | `test/*`, `chore/*`     |

Reglas de origen/destino:

- Las ramas de **frontend** salen de `frontend` y su PR vuelve a `frontend`.
- Las ramas de **backend** salen de `backend` y su PR vuelve a `backend`.
- Las ramas de **documentación global** (como esta refactorización de agentes) salen de `dev` y su PR vuelve a `dev`.

## Integración entre ramas permanentes

```txt
feat/* (frontend) ──PR──► frontend ─┐
                                    ├──PR──► dev ──PR (solo versión estable/demo)──► main
feat/* (backend)  ──PR──► backend  ─┘
docs/* , test/*   ──PR──► dev ──────┘
```

- `frontend` y `backend` se integran en `dev` **por Pull Request**.
- `dev` se integra en `main` **solo** para una versión estable o demo.
- Todo merge entre ramas permanentes lo aprueba y ejecuta **una persona**.

## Operaciones que un agente NUNCA ejecuta sin confirmación explícita

Un agente puede **proponer** estos comandos, pero **no los ejecuta** hasta que una persona lo pida de forma explícita:

- `git commit`
- `git push`
- `git merge`
- `git rebase`
- `git reset`
- `git clean`
- `git push --force` / `--force-with-lease`
- Borrado de ramas (`git branch -D`, `git push origin --delete`)

## Reglas anti-errores (siempre)

- **Prohibido `git add .` y `git add -A`.** Añadir archivos explícitamente, uno a uno.
- Antes de cualquier commit propuesto: `git status --short` y `git diff --name-only`.
- Nunca commitear `.env` ni secretos (ver [skills/SKILL_SECURITY_MINIMUM.md](skills/SKILL_SECURITY_MINIMUM.md)).
- Commits pequeños, descriptivos y en imperativo (`feat: ...`, `fix: ...`, `docs: ...`).
- Antes de mergear, pasar el [PR_REVIEW_CHECKLIST](PR_REVIEW_CHECKLIST.md).

## Procedimiento estándar (rama de trabajo)

```bash
# 1. Partir de la rama de integración correcta y actualizarla
git switch frontend        # o backend / dev según el tipo de cambio
git pull

# 2. Crear la rama de trabajo
git switch -c feat/mi-feature

# 3. Trabajar y, antes de proponer commit, REVISAR
git status --short
git diff --name-only

# 4. Añadir EXPLÍCITAMENTE (nunca `git add .`)
git add ruta/al/archivo.js ruta/al/test.js

# 5. Commit solo cuando una persona lo pida
git commit -m "feat: descripción breve en imperativo"

# 6. Push y PR hacia la rama de integración de origen (solo a petición humana)
git push -u origin feat/mi-feature
```

Ver también: [SKILL_GIT_SAFE_WORKFLOW.md](skills/SKILL_GIT_SAFE_WORKFLOW.md).
