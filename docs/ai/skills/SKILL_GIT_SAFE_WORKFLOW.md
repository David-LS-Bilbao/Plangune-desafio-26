# SKILL · Flujo Git seguro

Procedimiento para trabajar con Git en DESAFIO-26 sin romper ramas protegidas ni filtrar secretos.

## Principios

- `main` = estable/final. `dev` = integración. **No se trabaja directamente en ninguna.**
- Toda rama de trabajo sale de `dev`.
- Los PR van hacia `dev`.

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
# 1. Partir de dev actualizada
git switch dev
git pull

# 2. Crear rama de trabajo
git switch -c feat/mi-feature

# 3. Trabajar... y antes de commitear, REVISAR
git status --short
git diff --name-only

# 4. Añadir EXPLÍCITAMENTE (nunca `git add .`)
git add ruta/al/archivo.js ruta/al/test.js

# 5. Commit descriptivo
git commit -m "feat: descripción breve en imperativo"

# 6. Subir y abrir PR hacia dev
git push -u origin feat/mi-feature
```

## Reglas anti-errores

- **Nunca `git add .`** ni `git add -A`.
- Nunca commitear `.env` ni secretos (están en `.gitignore`).
- No hacer commit/push automático: que lo pida una persona.
- Antes de `merge`, pasar el [PR_REVIEW_CHECKLIST](../PR_REVIEW_CHECKLIST.md).

## Si te equivocaste de rama

```bash
git stash                 # guarda cambios sin commitear
git switch -c feat/correcta
git stash pop             # recupera los cambios en la rama correcta
```
