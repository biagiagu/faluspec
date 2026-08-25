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

## Historial

<Vacío hasta que se empiece. Acá van las decisiones, lo descartado y lo que quedó pendiente: nunca
en el encabezado ni en los criterios.>
