# Prueba 001 — Parametrización de cliente

> **Esto es un banco de pruebas, no la plantilla ni la spec.** Es contenido de un proyecto real
> escrito en el formato, para ver dónde el formato aguanta y dónde cruje. Nada de acá se copia a
> `plantilla/`. Lo que sí vuelve a FaLuSpec son los [hallazgos](HALLAZGOS.md).

## Qué se especificó

La parametrización pendiente de cliente del proyecto de origen (`011-SeguimientoDePedidos`): ese repo
deriva de otro proyecto del mismo producto para otro cliente, se copió sin historia, se limpiaron los
datos del cliente anterior, y quedó un conjunto de valores heredados **sin confirmar** marcados en el
código con `TODO(cliente)` y con el placeholder literal `CLIENTE.com.ar`.

Hoy ese trabajo existe sólo como prosa suelta: una lista de checkboxes al final de
`docs/operacion/BASE_PARA_NUEVO_PROYECTO.md` y tres viñetas en el `CLAUDE.md` del repo. No tiene
identificadores, ni criterios, ni forma de saber cuándo está hecho.

## Por qué este caso

- Es trabajo real y todavía **no especificado**: no se está transcribiendo un backlog existente.
- No depende de identificadores previos, así que no obliga a renumerar nada.
- Toca las tres cosas que el formato promete y nadie más tiene: ancla al símbolo, estrategia de
  verificación, y estado derivable.
- Y sobre todo: es trabajo **de configuración sobre código que ya existe**, que es el caso opuesto al
  que la spec v0.1 tuvo en mente. Si el formato sólo banca funcionalidad nueva, mejor saberlo ahora.

## Numeración

Los identificadores son los que corresponderían si esto se llevara al proyecto de origen: sus épicas
van de `E1` a `E18`, así que la primera libre es **`E19`**. El hito se numera `H1` dentro del caso
porque ese proyecto no tiene hitos numerados — su plan está organizado por sprints.

## Archivos

```
E19.md          la épica
E19-01.md …     un archivo por ítem (directorio plano, ver hallazgo 8)
H1.md           el hito
HALLAZGOS.md    qué aguantó el formato y qué no  ← el entregable
```
