---
id: E<n>-<nn>
epica: E<n>
titulo: <Una línea, en imperativo o sustantivo>
prioridad: <P0 | P1 | P2 | P3>
estado: <todo | wip | done | blocked>
fecha_estado: <aaaa-mm-dd — obligatorio en done y en blocked>
bloqueado_por: <obligatorio en blocked: qué se espera, y de quién>
depende_de: [<E<n>-<nn>>]
---

## Historia

Como <rol>, quiero <capacidad>, para <por qué importa>.

<El "para" es la parte que se saltea y la única que permite descartar el ítem cuando el motivo
desaparece.>

## Criterios

<Uno por afirmación verificable de forma independiente. Si se parte y deja de significar algo, no
era un criterio: era medio criterio.>

### E<n>-<nn>.1 — <título>

**Dado** <situación>, **cuando** <acción>, **entonces** <resultado observable desde afuera del código>.

- ancla: `<ruta/al/archivo.ext#simbolo>`
- verifica: `<unit | integracion | e2e | estatica | manual>` → `<archivo::nombre del test>`

### E<n>-<nn>.2 — <título>

**Dado** <...>, **cuando** <...>, **entonces** <...>.

- ancla: `ninguna` — <motivo: vive fuera del repo · el alcance es el repo entero · es el test mismo>
- verifica: `manual`

## Impacto

<Obligatorio en `done`. Qué movió este ítem fuera de sus propios criterios: otro ítem ya cerrado, una
regla de la constitución, el comportamiento de un ambiente. Si no movió nada, escribí "Ninguno". La
pregunta es obligatoria justamente porque la respuesta casi siempre es esa.>

## Historial

<Arranca cuando hay algo que registrar, no cuando empieza la implementación. Van acá las decisiones
sobre el ítem —por qué está bloqueado, qué se descartó al escribirlo, por qué un criterio cambió— y
las de implementación. Nunca en el encabezado ni en los criterios.>
