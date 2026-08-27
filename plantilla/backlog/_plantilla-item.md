---
id: E<n>-<nn>
epic: E<n>
title: <Una línea, en imperativo o sustantivo>
priority: <P0 | P1 | P2 | P3>
status: <todo | wip | done | blocked>
status_since: <aaaa-mm-dd — obligatorio en done y en blocked>
blocked_by: <obligatorio en blocked: qué se espera, y de quién>
depends_on: [<E<n>-<nn>>]
milestone: <opcional: H<n>, el corte de release al que pertenece. Sin hito también es válido.>
---

## Story

Como <rol>, quiero <capacidad>, para <por qué importa>.

<El "para" es la parte que se saltea y la única que permite descartar el ítem cuando el motivo
desaparece.>

## Criteria

<Uno por afirmación verificable de forma independiente. Si se parte y deja de significar algo, no
era un criterio: era medio criterio.>

### E<n>-<nn>.1 — <título>

**Dado** <situación>, **cuando** <acción>, **entonces** <resultado observable desde afuera del código>.

- anchor: `<ruta/al/archivo.ext#simbolo>`
- verify: `<unit | integration | e2e | static | manual>` → `<archivo::nombre del test>`

### E<n>-<nn>.2 — <título>

**Dado** <...>, **cuando** <...>, **entonces** <...>.

- anchor: `none` — <motivo: vive fuera del repo · el alcance es el repo entero · es el test mismo>
- verify: `manual`

## Impact

<Obligatorio en `done`. Qué movió este ítem fuera de sus propios criterios: otro ítem ya cerrado, una
regla de la constitución, el comportamiento de un ambiente. Si no movió nada, escribí "Ninguno". La
pregunta es obligatoria justamente porque la respuesta casi siempre es esa.>

## History

<Arranca cuando hay algo que registrar, no cuando empieza la implementación. Van acá las decisiones
sobre el ítem —por qué está bloqueado, qué se descartó al escribirlo, por qué un criterio cambió— y
las de implementación. Nunca en el encabezado ni en los criterios.>
