# SKILL · Flujo Git seguro

Procedimiento para trabajar con Git en DESAFIO-26 sin romper ramas protegidas ni filtrar secretos.
Política completa en [../GIT_BRANCHING_POLICY.md](../GIT_BRANCHING_POLICY.md).

## Principios

- `main` = estable/demo · `dev` = integración global · `frontend` y `backend` = integración por equipo. **No se trabaja directamente en ninguna de las cuatro.**
- Las ramas de **frontend** salen de `frontend` y su PR vuelve a `frontend`.
- Las ramas de **backend** salen de `backend` y su PR vuelve a `backend`.
- Las ramas de **docs/test globales** salen de `dev` y su PR vuelve a `dev`.
- `frontend`/`backend` se integran en `dev` por PR; `dev` se integra en `main` solo para versión estable/demo. Esas integraciones las hace **una persona**.

## Convención de ramas

```txt
feat/<nombre>   nueva funcionalidad
fix/<nombre>    corrección
docs/<nombre>   documentación
test/<nombre>   pruebas
chore/<nombre>  mantenimiento
```

## Procedimiento estándar

```bash
# 1. Partir de la rama de integración correcta y actualizarla
#    frontend → `frontend` · backend → `backend` · docs/test → `dev`
git switch frontend        # ejemplo para una feature de frontend
git pull

# 2. Crear rama de trabajo
git switch -c feat/mi-feature

# 3. Trabajar... y antes de commitear, REVISAR
git status --short
git diff --name-only

# 4. Añadir EXPLÍCITAMENTE (nunca `git add .`)
git add ruta/al/archivo.js ruta/al/test.js

# 5. Commit descriptivo (solo cuando una persona lo pida)
git commit -m "feat: descripción breve en imperativo"

# 6. Subir y abrir PR hacia la rama de integración de origen (solo a petición humana)
git push -u origin feat/mi-feature
```

## Reglas anti-errores

- **Nunca `git add .`** ni `git add -A`.
- Nunca commitear `.env` ni secretos (están en `.gitignore`).
- **Nunca `commit`, `push`, `merge`, `rebase`, `reset`, `clean` ni `force push` sin que lo pida una persona.**
- Antes de `merge`, pasar el [PR_REVIEW_CHECKLIST](../PR_REVIEW_CHECKLIST.md).

## Si te equivocaste de rama

```bash
git stash                 # guarda cambios sin commitear
git switch -c feat/correcta
git stash pop             # recupera los cambios en la rama correcta
```
