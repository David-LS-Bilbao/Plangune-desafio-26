# SKILL · Quality Gate post-código

Procedimiento de revisión después de modificar código en DESAFIO-26.

Esta skill se usa cuando un agente ya ha terminado una tarea de código y debe comprobar si el cambio está listo para revisión humana o PR.

No sustituye a la revisión humana. No autoriza commits, pushes, merges, rebases ni resets.

---

## Objetivo

Evitar que un cambio aparentemente terminado rompa:

* el arranque de frontend o backend;
* el contrato API;
* la demo;
* la seguridad básica;
* la documentación;
* el flujo Git seguro.

Aplicar calidad pragmática, no coverage ciego.

---

## Principios

* MVP primero.
* KISS: no añadir herramientas ni abstracciones si no son necesarias.
* No buscar 100% coverage global.
* Aplicar estrategia 100/80/0:

  * 100% en lógica core/crítica.
  * 80% en flujos importantes.
  * 0% en infraestructura trivial.
* Los tests deben proteger comportamiento, no inflar métricas.
* No proponer Playwright, Sentry, Swagger, Husky o Sonar como obligatorios para el MVP.
* Si el cambio no afecta a runtime, no inventar pruebas innecesarias.
* Si el cambio toca contrato API, actualizar documentación.
* Si el cambio toca seguridad, validar con criterio OWASP básico.

---

## Paso 1 · Revisar estado Git

Ejecutar:

```bash
git status --short
git diff --name-only
```

Comprobar:

* no hay archivos inesperados;
* no hay `.env`;
* no hay `node_modules/`;
* no hay `dist/`;
* no hay `coverage/`;
* no hay cambios mezclados de otra tarea;
* no se ha usado `git add .`.

Si hay archivos ajenos a la tarea, informar antes de continuar.

---

## Paso 2 · Revisar alcance

Responder internamente:

* ¿La tarea pedida está completada?
* ¿Se ha tocado solo lo necesario?
* ¿Se han añadido features no pedidas?
* ¿Hay refactor mezclado con feature?
* ¿Hay cambios de documentación, tests y código mezclados sin motivo?
* ¿El cambio respeta MVP y KISS?

Si el PR mezcla demasiadas cosas, recomendar dividirlo.

---

## Paso 3 · Validar backend si se ha tocado backend

Ejecutar desde la raíz:

```bash
npm run test:backend
```

Si el cambio toca API, comprobar además:

* endpoints montados bajo `/api`;
* shape de respuesta estable;
* errores con forma `{ "error": "<mensaje>" }`;
* códigos HTTP correctos;
* rutas públicas no exponen contenido no aprobado;
* los controllers no contienen lógica de negocio pesada;
* los services no dependen de `req`/`res`;
* el backend no depende de PostgreSQL/Ollama/Python para arrancar si el runtime sigue siendo mock.

Si se toca `recommendations`, `activities`, `reviews`, `incidents`, `favorites` o `assistant`, debe haber test de contrato o justificación clara.

---

## Paso 4 · Validar frontend si se ha tocado frontend

Ejecutar:

```bash
npm run test:frontend
```

Si no hay tests suficientes todavía, comprobar manualmente y documentar:

* la app arranca;
* la ruta afectada carga;
* no hay errores visibles en consola;
* la pantalla es usable en móvil;
* hay estados de error, vacío o carga si aplica;
* los formularios tienen labels o texto accesible;
* no se usan secretos en variables `VITE_*`;
* no se fija como técnico el nombre provisional de la app.

Si se toca conexión con API, comprobar que se usa `VITE_API_URL` y no URLs hardcodeadas.

---

## Paso 5 · Validar todo si el cambio es transversal

Ejecutar:

```bash
npm test
```

Usar este paso cuando el cambio afecte a:

* package root;
* workspaces;
* contrato frontend/backend;
* variables de entorno;
* scripts;
* documentación global;
* configuración compartida.

---

## Paso 6 · Revisión de seguridad mínima

Comprobar:

* no se han subido secretos;
* `.env.example` tiene valores ficticios;
* no se almacenan datos sensibles de menores;
* entradas de usuario validadas;
* errores internos no se exponen en producción;
* endpoints admin/negocio protegidos cuando exista auth;
* no se confía solo en ocultar botones en frontend;
* no hay HTML inseguro renderizado desde input de usuario;
* no se introduce dependencia innecesaria o sospechosa.

Si se añade una dependencia nueva, justificar por qué acelera el MVP.

---

## Paso 7 · Revisión de documentación

Si el cambio afecta comportamiento, actualizar o revisar:

* `README.md`;
* `docs/api.md`;
* `docs/database.md`;
* `docs/security.md`;
* `docs/ai/skills/`;
* `docs/ai/prompts/`;
* ADR o decisiones si aplica.

Preguntas mínimas:

* ¿La documentación promete algo que no está implementado?
* ¿Queda claro qué sigue siendo mock?
* ¿Queda claro qué no es runtime todavía?
* ¿El contrato API coincide con el código?
* ¿La instrucción de ejecución/prueba sigue siendo válida?

---

## Paso 8 · Clasificar riesgos

Usar esta escala:

### P0 · Bloqueante

Bloquea revisión/PR/merge si:

* la app no arranca;
* los tests existentes fallan;
* se rompe el contrato API;
* se exponen secretos;
* se elimina un fallback crítico;
* se permite acceso admin sin protección cuando hay auth;
* se introduce dependencia obligatoria de DB/Python/Ollama sin plan B;
* se rompe una ruta crítica de demo.

### P1 · Corregir antes de freeze

* falta test para lógica core;
* falta documentación de contrato;
* hay divergencia frontend/backend no documentada;
* hay validación incompleta en endpoints importantes;
* hay estado compartido frágil en tests;
* hay comentarios o cambios mezclados que ensucian el PR.

### P2 · Mejora futura

* refactor menor;
* limpieza de nombres;
* cobertura adicional no crítica;
* endurecimiento futuro;
* observabilidad;
* Playwright;
* Swagger/OpenAPI;
* Sentry;
* Husky;
* Sonar.

---

## Paso 9 · Informe final obligatorio

El agente debe terminar con este formato:

```md
## Informe post-código

### 1. Estado Git

- Rama:
- Archivos modificados:
- Archivos nuevos:
- Archivos fuera de alcance:

### 2. Qué se ha cambiado

Resumen breve.

### 3. Validación ejecutada

- Comando:
- Resultado:

### 4. Tests

- Nuevos tests:
- Tests existentes afectados:
- Resultado:

### 5. Seguridad

- Secretos:
- Validación:
- Datos sensibles:
- Riesgos:

### 6. Documentación

- Docs actualizadas:
- Docs pendientes:

### 7. Riesgos

- P0:
- P1:
- P2:

### 8. Recomendación

- Listo para revisión humana:
- Listo para PR:
- No listo todavía:

### 9. Acciones NO realizadas

Confirmar explícitamente:

- No hice commit.
- No hice push.
- No hice merge.
- No hice rebase.
- No hice reset.
- No borré ramas.
```

---

## Regla final

Si hay duda, no ocultar el problema.

Es mejor entregar un informe honesto con riesgos que afirmar que el cambio está listo sin haberlo validado.
