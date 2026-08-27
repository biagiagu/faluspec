# <Nombre del proyecto>

> Esqueleto FaLuSpec. Este README se reescribe: lo que sigue son instrucciones de arranque, no
> documentación de tu proyecto.

## Instalación

**En un repo vacío:** copiá el contenido de este directorio a la raíz.

**En un repo que ya existe** —el caso más común— copiá pieza por pieza, porque hay dos colisiones:

| Qué | Adónde | Ojo |
|---|---|---|
| `backlog/` | a la raíz | |
| `docs/CONSTITUCION.md`, `docs/PLAN.md`, `docs/decisiones/` | a tu `docs/` | no pises lo que ya tengas |
| `.claude/agents/*.md` | a tu `.claude/agents/` | conviven con los agentes que ya tengas |
| **este README** | a `docs/ARRANQUE-FALUSPEC.md` | **no** a la raíz: ahí ya está el README de tu proyecto |
| `.gitattributes` | a la raíz | si ya tenés uno, sumale la línea `*.md text eol=lf` |
| `.faluspec` | a la raíz | una línea con la versión del formato: no lo borres, las herramientas lo leen |

Hacelo en una rama corta, no en la rama principal. Y si tu repo corre un formateador de markdown en
CI, pasalo por él antes de commitear: estos archivos vienen formateados a mano y pueden no coincidir
con tu configuración.

El `.gitattributes` no es opcional si trabajás en Windows: sin él, `git` convierte los saltos de línea
al clonar, y cualquier vista regenerada aparece como modificada aunque el backlog no haya cambiado.

## Arranque

1. Completá `docs/CONSTITUCION.md`. Es el único documento obligatorio antes de escribir el primer
   ítem: define las prioridades, el DoD y el flujo de trabajo que el formato deliberadamente no fija.
2. Escribí tu primer hito en `docs/PLAN.md`. Un hito se define por **lo que significa para una
   persona**, no por una lista de entregables.
3. Escribí tu primera épica y tu primer ítem en `backlog/`, copiando los formularios `_plantilla-*`.
4. **Borrá los archivos que empiezan con `_`** cuando ya no los necesites: son formularios y ejemplos,
   no contenido tuyo.
5. Reescribí este documento, o borralo.

Nada de esto necesita herramientas. La validación automática todavía no existe; hasta que exista, el
agente `verificador` hace ese trabajo a mano — y encuentra cosas.

## Qué hay acá

```
docs/CONSTITUCION.md      principios, prioridades, DoD, flujo de git — completar primero
docs/PLAN.md              los hitos
docs/decisiones/          un archivo por decisión que valga la pena poder releer
backlog/                  un archivo por ítem, más las épicas
.claude/agents/           agentes que operan sobre el formato
```

## Decisiones que esta plantilla toma por vos

El formato deja algunas cosas abiertas a propósito. La plantilla elige un default para que puedas
arrancar sin decidirlas. Todas son reversibles:

| Cuestión | Default de la plantilla | Cuándo cambiarlo |
|---|---|---|
| Ubicación de los ítems | `backlog/` plano | Cuando pases de ~100 ítems y recorrerlo moleste |
| Dónde vive la épica | `backlog/E<n>.md`, junto a sus ítems | Nunca, salvo que separes por directorio |
| Dónde vive el historial | Sección `## History` al final del ítem | Si el ítem se vuelve ilegible de tan largo |
| Prioridades | `P0` … `P3` | Cuando tu equipo use otra escala |

Las dos del medio el formato **no las define**: son huecos reales, no decisiones tuyas. Si tu proyecto
encuentra un motivo para resolverlas distinto, eso es información valiosa para FaLuSpec.
