# Backlog

Un archivo por ítem, y un archivo por épica. **Los ítems son la fuente**: cualquier tabla, resumen o
mapa que armes sale de acá y no al revés. Una tabla escrita a mano no se puede validar ni regenerar,
y dos personas editándola chocan en cada merge.

## Nombres de archivo

```
E<n>.md            la épica            E4.md
E<n>-<nn>.md       el ítem             E4-07.md
```

Los criterios no tienen archivo: viven dentro del ítem, como `### E4-07.2 — …`.

## Reglas que no se negocian

- **Los identificadores no se reciclan.** Un ítem descartado deja su número quemado.
- **No se renumera** para tapar huecos. El hueco es información: algo existió ahí.
- **De `done` no se vuelve.** Si algo cerrado se rompió, es un ítem nuevo.
- **El historial no es el criterio.** El ítem vigente dice *qué tiene que ser cierto*; el historial,
  *cómo llegamos*. Mezclarlos convierte el backlog en un changelog.

## Archivos que hay que borrar

`_plantilla-item.md`, `_plantilla-epica.md` y `_ejemplo-E4-07.md` son formularios y ejemplo. Copialos
y después borralos.
