# 001 — Por qué existe FaLuSpec en vez de adoptar algo publicado

- **Fecha:** 2026-08-25
- **Estado:** decidido
- **Alternativas evaluadas:** OpenSpec v1.10.0 · github/spec-kit · seguir sin formalizar

## Contexto

Existía una forma de trabajo que funcionaba en dos proyectos: backlog con épicas e identificadores,
criterios de aceptación anclados al código, plan con hitos, definición de «listo» con gate de
promoción, y un conjunto de agentes que operaban sobre esos documentos.

El problema no era la calidad del método sino su **replicabilidad**: método y proyecto vivían fundidos
en los mismos archivos. Derivar un proyecto nuevo costó copiar y limpiar a mano miles de líneas, con
riesgo de arrastrar datos del cliente anterior.

Antes de construir algo propio se evaluó adoptar una de las dos herramientas establecidas del nicho.

## Qué se encontró

Las capacidades de ambas se verificaron **ejecutando sus CLI**, no leyendo sus README.

**El formato propio ya era más rico que el de las dos alternativas.** Sus criterios tenían
identificador de tercer nivel, escenario Dado/Cuando/Entonces, ancla al código y estrategia de test.
OpenSpec genera un escenario sin identificador, sin ancla y sin estrategia; Spec Kit tampoco los tiene.
Adoptar cualquiera de las dos habría sido **perder información**.

**Cada sistema deja vacía exactamente una capa**, y por motivos distintos:

| Capa | Método propio | OpenSpec | Spec Kit |
|---|---|---|---|
| Producto — épicas, releases, prioridad, dependencias | nativa | rechazada por filosofía | delegada a GitHub |
| Especificación | átomo más rico | su núcleo | su núcleo |
| Ejecución — DoD y gates | DoD dual | parcial | parcial |
| Herramientas | **inexistente** | CLI completo | CLI completo |

En OpenSpec la ausencia es una decisión declarada («fluid not rigid, iterative not waterfall»); en
Spec Kit, una delegación. En el método propio era **trabajo no hecho**.

## Decisión

Construir un formato propio, tomando de las alternativas sus soluciones de ingeniería y descartando
sus decisiones de posicionamiento.

**Se toma:**

- La separación entre vigente e histórico (de OpenSpec) — la mejor idea de las dos.
- La validación como comando que falla en CI (de OpenSpec).
- La constitución de principios como documento citable (de Spec Kit).
- El directorio como unidad de trabajo (de ambas) — es lo que habilita tooling y concurrencia.

**No se toma:**

- Renunciar a la capa de producto (OpenSpec). Es precisamente la ventaja del método.
- Delegar el plan a GitHub (Spec Kit). Rompe la premisa de plan y código versionados juntos.
- Un ciclo de diez comandos (Spec Kit). La liviandad es una virtud.

**Se corrige del método original:**

- Las anclas dejan de apuntar a números de línea y pasan a apuntar a **símbolos**. Era el rasgo más
  distintivo y a la vez el más frágil: una línea se pudre en silencio, un símbolo se resuelve
  mecánicamente. Este cambio es lo que hace posible el validador.

## Consecuencias

- Hay que escribir y mantener un formato, una plantilla y eventualmente un CLI que nadie más mantiene.
- Se gana un átomo que ningún competidor tiene y que no compite con ellos: complementa.
- El riesgo real es el abandono a mitad de camino. Se mitiga con el orden de fases: si la fase 0 se
  completa y todo lo demás se cae, queda una plantilla que ya cumple el objetivo original.

## Evidencia

El análisis completo quedó en tres documentos:

1. **Método propio, OpenSpec o Spec Kit** — la comparación aplicada a un proyecto concreto.
   <https://claude.ai/code/artifact/f88ab45d-2a52-4388-86e8-942055345d3b>
2. **De método a framework** — la evaluación del método como sistema, abstraído de su proyecto.
   <https://claude.ai/code/artifact/1eb64913-e05e-4cf4-af23-24c15ddb5797>
3. **El método como producto** — el plan de tres fases para construirlo.
   <https://claude.ai/code/artifact/e01c25ba-8d84-47df-b8df-8828f72d296a>
