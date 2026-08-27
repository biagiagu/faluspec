# Hallazgos de la prueba 004 — las otras vistas

**Corrida:** 2026-08-26 · dos backlogs: el [fixture](fixture/) sintético (9 ítems, 3 épicas) y el real
de `011-SeguimientoDePedidos` (9 ítems, 1 épica).

**Las tres vistas coinciden byte a byte con las escritas a mano.** Bloqueos, resumen por épica y story
map. Con esto **las cuatro vistas derivables de `backlog/` se generan**; la quinta —cobertura por
criterio— necesita resolver anclas contra el código y es trabajo de la fase 2.

Igual que en la 003, las vistas a mano se commitearon **antes** que el generador.

## Por qué un fixture inventado

La 003 declaró que su gate probaba poco: una épica, sin huecos, nueve ítems. El fixture existe para
ejercitar eso — tres épicas con `E4 < E7 < E19`, huecos de numeración, `E19-03` contra `E19-10`, un
bloqueo heredado de la épica y otro propio, ítems con y sin hito. Es **forma pura**: no sale de ningún
proyecto.

Correr las mismas vistas contra el backlog **real** después es lo que dio los hallazgos de abajo. El
fixture prueba que el generador hace lo que dice; el backlog real prueba si lo que dice sirve.

---

## W1 · La vista de bloqueos promete agrupar y contra datos reales no agrupa nada

En el fixture agrupa bien. **Contra 011 produjo siete filas para siete ítems**, cuando los siete
esperan lo mismo: que el cliente entregue sus datos. Dicen lo mismo con palabras distintas —«no
informó desde qué depósitos despacha», «no informó con qué transportistas despacha»— y el agrupamiento
es por **igualdad textual**.

La vista cumple su especificación y no cumple su promesa. Agrupar por texto exacto sólo funciona si
alguien copia y pega la misma frase, que es justo lo que el `bloqueado_por` de épica vino a evitar —
pero 011 escribió su backlog antes de que existiera.

**Aplicado:** `VISTAS.md` §4 dice ahora explícitamente que agrupa por texto exacto y que la forma de
agrupar de verdad es declarar la causa **en la épica**. La vista deja de prometer lo que no puede.

## W2 · Una causa larga destruye la tabla, y truncar está prohibido

El `bloqueado_por` más largo de 011 tiene 190 caracteres, y la tabla se vuelve ilegible. Pero la regla
3 de `VISTAS.md` prohíbe truncar: una vista omite, nunca resume en palabras propias.

Las dos cosas son correctas y chocan. La salida no es aflojar la regla, es **que el campo sea corto en
origen**: `bloqueado_por` es una línea que dice qué se espera y de quién, y el detalle va al historial.
Eso ya estaba escrito, y nadie lo respetó — incluida la sesión que arrancó 011, que metió tres
renglones de explicación.

**Aplicado:** la especificación lo dice más fuerte en §3.2, y el `verificador` lo chequea.

## W3 · El orden con empate no estaba declarado, y hubo empate al primer intento

`VISTAS.md` decía «ordenada por `Desde`». Contra 011, **las siete filas tienen la misma fecha**. Qué
va primero quedó decidido por un detalle de implementación —Python ordena la tupla completa, así que
desempató por texto de la causa— y otro generador igualmente correcto habría dado otro orden.

Es el mismo hallazgo que el orden numérico de la 003, en otra vista: **un orden parcialmente declarado
no es un orden.** Cada vista tiene que declarar su desempate hasta que el resultado sea único.

**Aplicado:** desempate por el identificador del primer ítem del grupo, numérico.

## W4 · La abreviatura opcional rompe la comparabilidad

El story map permitía abreviar un rango contiguo (`E19-01 … E19-09`) y decía «se puede». Contra 011,
los nueve ítems son contiguos: mi generador los listó todos, y otro que abreviara habría sido
**igualmente válido según la especificación** y habría producido un archivo distinto.

Una vista con dos salidas válidas no se puede comparar, y comparar es todo lo que hace el gate.

**Aplicado:** la abreviatura **se prohíbe**. Ahorraba ancho y costaba unicidad, y el ancho ya se paga
en otro lado.

## W5 · El story map lee `backlog/`, pero los hitos viven en el plan

Las columnas salen de los valores de `hito` que declaran los ítems. Consecuencias:

- un hito declarado en `docs/PLAN.md` **sin ítems asignados no aparece** — y es justamente el que hay
  que mirar, porque significa un corte de release vacío;
- un ítem con `hito: H9` inexistente **crea una columna** en vez de fallar. La regla 8 de la
  especificación dice que el hito debe existir, pero la vista no tiene con qué comprobarlo;
- el encabezado «generado desde `backlog/`» es incompleto para esta vista.

**No aplicado.** Es la primera vista que necesita **dos fuentes**, y eso toca dónde vive el plan.
Queda para la fase 2, con el validador, que ya va a tener que leer las dos cosas para comprobar la
regla 8.

## W6 · Los separadores no eran consistentes entre vistas

La tabla de backlog unía `depende_de` con `, `; el story map usaba ` · `; la vista de bloqueos no
declaraba nada y hubo que elegir. Tres vistas, dos convenciones y un hueco.

**Aplicado:** ` · ` en todas las celdas de varios valores. El generador de la prueba 003 se actualizó
y su gate se volvió a correr: sigue coincidiendo. No cambió ninguna celda, porque ningún ítem de ese
backlog tiene dos dependencias — o sea que **la 003 nunca ejercitó el separador que definía**. Un
detalle de cobertura que sólo se ve mirando dos pruebas juntas.

## W7 · Contra 011, el story map salió con una sola columna: `sin hito`

Los nueve ítems son de la v0.3 y no tienen el campo. La vista salió «bien» —hizo lo que dice— y es
**inútil**, sin que nada avise de que está leyendo un backlog viejo.

Es la decisión abierta §9.3 por tercera vez, ahora con consecuencia visible. Un backlog tiene que
declarar contra qué versión del formato está escrito, o cada herramienta va a tener que adivinar.

---

## Estado de la fase 1

| Vista | Se genera | Coincide con la escrita a mano |
|---|---|---|
| Tabla de backlog | ✅ | ✅ (prueba 003) |
| Resumen por épica | ✅ | ✅ |
| Bloqueos | ✅ | ✅ · con la limitación W1 |
| Story map | ✅ | ✅ · con la limitación W5 |
| Cobertura por criterio | ❌ | necesita resolver anclas: fase 2 |

**El entregable de la fase 1 está completo** en lo que se puede derivar de `backlog/`. Lo que queda
—cobertura, y la comprobación de que un `hito` declarado existe— no es más trabajo de vistas: es el
validador.
