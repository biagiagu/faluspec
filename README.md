# FaLuSpec

Un formato para especificar trabajo de software de modo que **una máquina pueda verificarlo**.

> **Estado: fase 0 — la spec del formato.** Todavía no hay herramientas. Ver [el plan](#el-plan).

## La idea en un párrafo

Casi todos los métodos de especificación producen requisitos que una persona puede leer. FaLuSpec
produce requisitos que además **saben dónde viven en el código y con qué se comprueban**. Esa es toda
la diferencia, y de ahí sale todo lo demás: si un criterio conoce su ancla y su verificación, entonces
un validador puede detectar cuándo se pudrió, un reporte puede medir cobertura criterio por criterio,
y un agente puede recibir un identificador como orden de trabajo sin tener que salir a buscar dónde
tocar.

## El átomo

```markdown
### E4-07.2 — Reintento con espera creciente

**Dado** un envío que falló por error de red, **cuando** el reintento se programa,
**entonces** la espera es el doble de la anterior, con un techo de 30 minutos.

- ancla: `src/notificaciones/reintento.ts#calcularEspera`
- verifica: `unit` → `reintento.test.ts::espera creciente con techo`
```

Cuatro partes: identificador direccionable, escenario observable, ancla al símbolo, estrategia de
verificación. Las dos últimas son las que no tiene nadie más.

La [especificación completa](docs/ESPECIFICACION.md) define los cuatro constructos —criterio, ítem,
épica, hito—, la gramática de identificadores, los estados y sus transiciones legales.

## Para quién es

Equipos chicos y solistas que trabajan con agentes de IA y quieren **el plan adentro del repo**,
versionado junto al código, en vez de en un tablero aparte.

No compite con Jira ni con Linear. Si tu planificación ya vive cómoda en un issue tracker, esto no te
resuelve nada.

## Qué hay acá

```
docs/ESPECIFICACION.md    la definición del formato
docs/decisiones/          por qué existe y contra qué se comparó
plantilla/                el esqueleto que se clona para un proyecto nuevo
```

## El plan

| Fase | Entregable | Gate para pasar a la siguiente |
|---|---|---|
| **0 · en curso** | Spec del formato, plantilla, constitución base | Un proyecto nuevo arranca desde la plantilla en horas |
| **1** | Un archivo por ítem como fuente; tablas y mapa como vistas generadas | El backlog en tabla se regenera y coincide con el escrito a mano |
| **2** | CLI: `validate` · `init` · `map` · `status` · `archive` | El validador corre en CI y atrapa una regresión real |

El orden importa. Un validador contra un formato que todavía no está definido no valida nada, y el
formato sólo termina de definirse escribiéndolo y estrellándolo contra un caso real.

## Origen

FaLuSpec no se diseñó de cero: se **destiló** de una forma de trabajo que ya funcionaba en dos
proyectos reales, con la intención de separarla de ellos para poder replicarla. El registro de esa
decisión, incluida la comparación contra las alternativas existentes, está en
[docs/decisiones](docs/decisiones/).
