# Checklist de revisión de PR · DESAFIO-26

Revisar antes de abrir y antes de mergear un Pull Request. Los PR van **siempre hacia `dev`**.

## Git e higiene

- [ ] La rama sale de `dev` y sigue la convención (`feat/*`, `fix/*`, `docs/*`, `test/*`).
- [ ] No hay commits directos a `main` ni `dev`.
- [ ] No se usó `git add .`; los archivos añadidos son los esperados.
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

## Documentación

- [ ] Documentación afectada actualizada.
- [ ] Descripción del PR clara: qué, por qué y cómo probar.

## Cierre

- [ ] Riesgos conocidos anotados en el PR.
- [ ] Siguiente paso / rama recomendada indicada.
