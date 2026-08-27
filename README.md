# FaLuSpec

Un formato para especificar trabajo de software de modo que **una máquina pueda verificarlo**.

> **Estado: fases 0 y 1 cerradas, fase 2 en curso.** El formato está definido y probado contra casos
> reales, cuatro de sus cinco vistas se generan, y `faluspec validate` ya atrapa un ancla rota que
> `tsc` y los tests dejan pasar. Ver [el plan](#el-plan).
>
> **Es un framework público** ([decisión 003](docs/decisiones/003-faluspec-es-publico.md)): cualquiera
> puede adoptarlo. **Hasta la 1.0 el formato puede romper compatibilidad** — quien adopte hoy va a
> tener que migrar, y a cambio sus hallazgos todavía pueden cambiar el formato.

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

- anchor: `src/notificaciones/reintento.ts#calcularEspera`
- verify: `unit` → `reintento.test.ts::espera creciente con techo`
```

Cuatro partes: identificador direccionable, escenario observable, ancla al símbolo, estrategia de
verificación. Las dos últimas son las que no tiene nadie más.

La [especificación completa](docs/ESPECIFICACION.md) define los cuatro constructos —criterio, ítem,
épica, hito—, la gramática de identificadores, los estados y sus transiciones legales.

## Para quién es

Equipos chicos y solistas que trabajan con agentes de IA y quieren **el plan adentro del repo**,
versionado junto al código, en vez de en un tablero aparte.

Los nombres de campo del formato están en inglés; la documentación, en español. Lo que se escribe en
un backlog queda en el repositorio de quien lo adopte y no se puede traducir después sin romperle el
trabajo — un documento sí.

No compite con Jira ni con Linear. Si tu planificación ya vive cómoda en un issue tracker, esto no te
resuelve nada.

## Qué hay acá

```
cli/                      faluspec validate — Node/TypeScript
docs/ESPECIFICACION.md    la definición del formato — v0.6
docs/VISTAS.md            la forma de lo que se genera a partir de los ítems
docs/decisiones/          por qué existe y contra qué se comparó
docs/pruebas/             los casos reales contra los que se probó, con sus hallazgos
plantilla/                el esqueleto que se clona para un proyecto nuevo
```

Ninguna de las tres versiones que el formato lleva encima salió de discutirlo: salieron de usarlo. La
0.2, de escribir un caso real con él; la 0.3, de arrancar un proyecto, cerrar un ítem y auditarlo; la
0.4, de intentar generar una vista y encontrar que era imposible. Cada modo de uso encontró huecos
distintos.

## El plan

| Fase | Entregable | Gate para pasar a la siguiente |
|---|---|---|
| **0 · cerrada** | Spec del formato, plantilla, constitución base | ✅ un proyecto real arrancó desde la plantilla en **1 hora** ([prueba 002](docs/pruebas/002-arranque-desde-plantilla/HALLAZGOS.md)) |
| **1 · cerrada** | Un archivo por ítem como fuente; tablas y mapa como vistas generadas | ✅ las cuatro vistas derivables se generan y coinciden **byte a byte** con las escritas a mano ([003](docs/pruebas/003-vistas-generadas/HALLAZGOS.md) · [004](docs/pruebas/004-las-otras-vistas/HALLAZGOS.md)) |
| **2 · en curso** | CLI: `validate` · `init` · `map` · `status` · `archive` | ✅ atrapa una regresión real ([prueba 005](docs/pruebas/005-el-validador-atrapa/HALLAZGOS.md)) · ❌ correr en CI necesita que el CLI sea instalable, que es fase 3 |

El orden importa. Un validador contra un formato que todavía no está definido no valida nada, y el
formato sólo termina de definirse escribiéndolo y estrellándolo contra un caso real.

## Origen

FaLuSpec no se diseñó de cero: se **destiló** de una forma de trabajo que ya funcionaba en dos
proyectos reales, con la intención de separarla de ellos para poder replicarla. El registro de esa
decisión, incluida la comparación contra las alternativas existentes, está en
[docs/decisiones](docs/decisiones/).
