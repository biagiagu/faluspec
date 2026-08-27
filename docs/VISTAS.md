# FaLuSpec — las vistas

> Versión 0.2 · borrador · 2026-08-26 · acompaña a la [especificación](ESPECIFICACION.md) §8.
>
> Define **la forma de lo que se genera**. Como la especificación, no puede mencionar un dominio, un
> cliente ni un stack concreto.

## 1. Qué es una vista

Una proyección de los ítems, escrita en un archivo, que responde **una** pregunta que los ítems
responden mal por estar repartidos en muchos archivos.

Los ítems son la fuente. Una vista **no tiene información propia**: cada celda sale de un campo de un
ítem, o de contar campos de varios. Si un dato existe sólo en la vista, no es un dato — es un error
que la próxima regeneración va a borrar.

### 1.1 Reglas que valen para todas

1. **Determinista.** El mismo backlog produce el mismo archivo, byte por byte. Sin fechas de
   generación, sin números de corrida, sin nada que cambie solo. Un diff de una vista tiene que ser
   siempre un cambio real del backlog.
2. **Orden declarado.** Cada vista dice cómo ordena. Sin orden estable, el diff se llena de ruido y
   deja de servir.
3. **Omite, nunca inventa.** Una vista puede dejar afuera información; no puede agregar, interpretar,
   resumir en palabras propias ni redondear. Un porcentaje redondeado es un dato inventado: se escribe
   la fracción.
4. **Marcada como generada.** Encabezado fijo, primera línea, diciendo qué la genera y desde dónde.
5. **No se edita.** Editar una vista es trabajo que se pierde. Si falta un dato, falta en el ítem.
6. **Valor ausente es `—`.** Un campo opcional vacío se escribe con raya, no con celda en blanco: la
   celda en blanco no distingue «no tiene» de «se me olvidó».

### 1.2 El encabezado

Todas empiezan igual:

```markdown
<!-- generado desde backlog/ — no editar a mano -->
```

Sin fecha. La fecha la da el control de versiones, que además no miente.

---

## 2. Tabla de backlog

**Pregunta que responde:** qué hay que hacer, en qué estado está, y qué lo traba.

Agrupada por épica. Épicas por número; ítems por identificador.

```markdown
<!-- generado desde backlog/ — no editar a mano -->

# Backlog

## E4 — Notificaciones

| ID | Título | Prio | Estado | Desde | Depende de |
|---|---|---|---|---|---|
| E4-03 | Cola de envío | P0 | done | 2026-03-02 | — |
| E4-07 | Reintento de notificaciones fallidas | P1 | done | 2026-03-14 | E4-03 |
| E4-11 | Aviso al equipo cuando se agotan los reintentos | P2 | todo | — | E4-07 |
```

| Columna | Sale de |
|---|---|
| `ID` | `id` |
| `Título` | `titulo`, tal cual, sin truncar |
| `Prio` | `prioridad` |
| `Estado` | `estado`, tal cual |
| `Desde` | `fecha_estado`, o `—` |
| `Depende de` | `depende_de` unido por `, `, o `—` |

El encabezado de cada épica sale de `id` y `titulo` de la épica.

**No lleva:** criterios, historia, impacto, historial. Para eso está el ítem. Una tabla que intenta
llevar los criterios deja de ser una vista y pasa a competir con la fuente — que es exactamente el
error que este formato existe para evitar.

---

## 3. Resumen por épica

**Pregunta que responde:** dónde está parado el proyecto.

```markdown
<!-- generado desde backlog/ — no editar a mano -->

# Resumen por épica

| Épica | Título | todo | wip | blocked | done | Total | Cerrado |
|---|---|---|---|---|---|---|---|
| E4 | Notificaciones | 1 | 0 | 0 | 2 | 3 | 2/3 |
| E19 | Parametrización de cliente | 1 | 0 | 7 | 1 | 9 | 1/9 |
| **Total** | | 2 | 0 | 7 | 3 | 12 | 3/12 |
```

Conteo de `estado` de los ítems de cada épica. `Cerrado` es una **fracción**, nunca un porcentaje:
`1/9` y `11%` dicen lo mismo hasta que el redondeo empieza a mentir.

Ordenada por número de épica. La fila de total va al final.

---

## 4. Bloqueos

**Pregunta que responde:** qué está trabado, por quién, y desde cuándo.

Es la vista que hizo posible `bloqueado_por` (§3.2 y §4 de la especificación). Antes esta pregunta
sólo se contestaba abriendo los ítems de a uno.

```markdown
<!-- generado desde backlog/ — no editar a mano -->

# Bloqueos

| Qué se espera | Ítems | Desde |
|---|---|---|
| el cliente todavía no confirmó qué depósitos usa | E19-03 | 2026-08-25 |
| el cliente todavía no entregó su lista de transportistas | E19-04 | 2026-08-25 |
```

Una fila por **causa**, no por ítem: los ítems que comparten `bloqueado_por` textual se agrupan, y sus
identificadores van en la misma celda. Un `bloqueado_por` declarado en la épica agrupa a todos sus
ítems `blocked` que no declaren uno propio.

`Desde` es la `fecha_estado` más antigua del grupo — hace cuánto que eso está trabado, no cuándo se
anotó el último.

Ordenada por `Desde`, la más vieja arriba. Lo que más tiempo lleva parado se lee primero.

---

## 5. Cobertura por criterio

**Pregunta que responde:** cuánto de lo que afirmamos está realmente comprobado, y por quién.

Es la vista que justifica que `verifica` y `ancla` sean campos y no prosa.

```markdown
<!-- generado desde backlog/ — no editar a mano -->

# Cobertura por criterio

| Criterio | Ítem | Verificación | Test | Ancla |
|---|---|---|---|---|
| E4-07.1 | done | unit | reintento.test.ts::espera creciente con techo | ✓ |
| E4-07.5 | done | manual | — | ninguna |

## Totales

| | Criterios | |
|---|---|---|
| unit | 12 | 12/21 |
| integracion | 3 | 3/21 |
| e2e | 0 | 0/21 |
| estatica | 2 | 2/21 |
| **manual** | **4** | **4/21** |
| sin ancla declarada (`ninguna`) | 5 | 5/21 |
| anclas que no resuelven | 0 | — |
```

| Columna | Sale de |
|---|---|
| `Criterio` | el identificador del criterio |
| `Ítem` | el `estado` del ítem que lo contiene |
| `Verificación` | el tipo declarado |
| `Test` | el test nombrado, o `—` si el tipo es `manual` |
| `Ancla` | `✓` si resuelve · `ninguna` si está declarada así · `✗` si no resuelve |

Las dos últimas filas de totales son las que valen: **qué porcentaje del proyecto depende de una
persona mirando**, y **cuánto de la especificación dejó de tener sustento en el código**. Un `✗` es un
incidente, no una métrica: significa que el código se movió y la especificación quedó mintiendo.

---

## 6. Story map

**Pregunta que responde:** qué entra en cada corte de release.

Filas: épicas. Columnas: hitos. Celdas: los ítems de esa épica cuyo campo `hito` apunta a ése.

Es además la vista que responde **qué contiene un hito**, pregunta que antes contestaba el propio
hito con una lista escrita a mano.

```markdown
<!-- generado desde backlog/ — no editar a mano -->

# Story map

| Épica | H1 | H2 | sin hito |
|---|---|---|---|
| E4 | E4-03 · E4-07 | E4-11 | — |
| E19 | E19-01 … E19-09 | — | — |
```

La columna `sin hito` no es un defecto: un ítem puede existir sin estar asignado a ningún corte. Que
se vea es el punto.

Columnas ordenadas por número de hito, con `sin hito` siempre al final. Dentro de cada celda, los
ítems por identificador, unidos por ` · `. Un rango contiguo se puede abreviar `E19-01 … E19-09`
**sólo** si no falta ninguno en el medio: abreviar salteando un hueco sería inventar.

---

## 7. Lo que las vistas le piden al formato

Definir las vistas destapó un hueco que escribiendo ítems no se veía.

### V1 · La relación entre ítem e hito no era derivable · **resuelto en la v0.4**

Un hito declaraba `Contiene: E2, E4, E10 completas · E6 sin el heatmap` — **prosa**. Se lee bien y no
se computa: «E6 sin el heatmap» no dice qué ítems son. El story map necesitaba saber, para cada ítem,
a qué hito pertenece, y esa relación no existía en ningún campo.

**Resuelto:** la relación vive en el ítem, en el campo `hito` (especificación §3.2), y el hito dejó de
llevar su lista de contenido (§5.1). El hito conserva lo único que una máquina no puede derivar —su
significado— y pierde una lista que se desactualizaba sola.

Fue el primer cambio del formato que **no salió de escribir ni de implementar, sino de intentar
generar algo**. Vale anotarlo: cada modo de uso encuentra huecos distintos.

### V2 · La cobertura necesita resolver anclas, y eso ya no es leer archivos

Las cuatro primeras vistas se derivan leyendo encabezados y contando. La columna `Ancla` de la
cobertura necesita **abrir el código y buscar un símbolo** — es el mismo trabajo que hace el validador
de la fase 2.

No es un problema del formato, pero sí una frontera que conviene declarar: la cobertura es la primera
vista que no se puede hacer a mano en un proyecto real, y la que va a empujar el CLI.
