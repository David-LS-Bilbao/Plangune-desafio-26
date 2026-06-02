# Checklist de revisión de PR · DESAFIO-26

Revisar antes de abrir y antes de mergear un Pull Request. El **destino del PR depende del origen** (ver [GIT_BRANCHING_POLICY.md](GIT_BRANCHING_POLICY.md)): frontend → `frontend`, backend → `backend`, docs/test globales → `dev`. La integración de `frontend`/`backend` en `dev` y de `dev` en `main` la hace una **persona**.

> Antes de abrir el PR, pasa el **quality gate post-código**: [skills/SKILL_QUALITY.md](skills/SKILL_QUALITY.md) (estado Git, alcance, tests por área, seguridad mínima, clasificación P0/P1/P2 e informe final).

## Git e higiene

- [ ] La rama sale de la integración correcta (frontend de `frontend`, backend de `backend`, docs/test de `dev`) y sigue la convención (`feat/*`, `fix/*`, `docs/*`, `test/*`).
- [ ] El PR apunta a la rama de integración correcta.
- [ ] No hay commits directos a `main`, `dev`, `frontend` ni `backend`.
- [ ] No se usó `git add .`; los archivos añadidos son los esperados.
- [ ] No se ejecutó `merge`, `rebase`, `reset`, `clean` ni `force push` sin autorización.
- [ ] `git status --short` y `git diff --name-only` revisados.
- [ ] No se cuela `.env`, secretos, `node_modules/`, `dist/` ni `coverage/`.

## Código

- [ ] Cambios mínimos y enfocados al objetivo del PR.
- [ ] Backend respeta MVC (routes → controllers → services → models).
- [ ] Frontend mobile-first, CSS propio, sin TypeScript ni Tailwind.
- [ ] Sin `console.log` de depuración olvidados.
- [ ] Nombres técnicos usan `DESAFIO-26` (no se fija el nombre provisional de la app).

## Tests

- [ ] `npm test` pasa (backend y frontend).
- [ ] Cada cambio de comportamiento tiene su test.

## Seguridad

- [ ] Entradas de usuario validadas/saneadas en backend.
- [ ] No se exponen secretos en el cliente (solo variables `VITE_*` necesarias).
- [ ] No se almacenan datos sensibles de menores.
- [ ] Con auth/roles: control de acceso por middleware; revisado **Broken Access Control / IDOR**.
- [ ] Código generado por IA revisado por una persona (auditoría humana).

## Documentación

- [ ] Documentación afectada actualizada.
- [ ] Descripción del PR clara: qué, por qué y cómo probar.

## Cierre

- [ ] Riesgos conocidos anotados en el PR.
- [ ] Siguiente paso / rama recomendada indicada.
