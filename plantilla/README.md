# <Nombre del proyecto>

> Esqueleto FaLuSpec. Este README se reescribe: lo que sigue son instrucciones de arranque, no
> documentación de tu proyecto.

## Arranque

1. Copiá este directorio a tu repo nuevo.
2. Completá `docs/CONSTITUCION.md`. Es el único documento obligatorio antes de escribir el primer
   ítem: define las prioridades, el DoD y el flujo de trabajo que la especificación deliberadamente
   no fija.
3. Escribí tu primer hito en `docs/PLAN.md`. Un hito se define por **lo que significa para una
   persona**, no por una lista de entregables.
4. Escribí tu primera épica y tu primer ítem en `backlog/`, copiando los formularios `_plantilla-*`.
5. **Borrá los archivos que empiezan con `_`** cuando ya no los necesites: son formularios y ejemplos,
   no contenido tuyo.
6. Reescribí este README.

Nada de esto necesita herramientas. La fase de validación automática todavía no existe; hasta que
exista, el agente `agentes/verificador.md` hace ese trabajo a mano.

## Qué hay acá

```
docs/CONSTITUCION.md      principios, prioridades, DoD, flujo de git — completar primero
docs/PLAN.md              los hitos
docs/decisiones/          un archivo por decisión que valga la pena poder releer
backlog/                  un archivo por ítem, más las épicas
agentes/                  agentes que operan sobre el formato
```

## Decisiones que esta plantilla toma por vos

La especificación deja algunas cosas abiertas a propósito (§9). La plantilla elige un default para
que puedas arrancar sin decidirlas. Todas son reversibles:

| Cuestión | Default de la plantilla | Cuándo cambiarlo |
|---|---|---|
| Ubicación de los ítems | `backlog/` plano | Cuando pases de ~100 ítems y recorrerlo moleste |
| Dónde vive la épica | `backlog/E<n>.md`, junto a sus ítems | Nunca, salvo que separes por directorio |
| Dónde vive el historial | Sección `## Historial` al final del ítem | Si el ítem se vuelve ilegible de tan largo |
| Prioridades | `P0` … `P3` | Cuando tu equipo use otra escala |

Las dos del medio la especificación **no las define**: son huecos reales del formato, no decisiones
tuyas. Si tu proyecto encuentra un motivo para resolverlas distinto, eso es información valiosa para
FaLuSpec.
