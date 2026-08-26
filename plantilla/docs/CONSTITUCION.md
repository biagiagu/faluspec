# Constitución — <Nombre del proyecto>

> **Qué es este documento.** Todo lo que FaLuSpec deliberadamente no define: prioridades, definición
> de listo, flujo de git, herramientas, cómo se trabaja con agentes. El formato define la forma de los
> documentos; esto define cómo trabaja **este** proyecto.
>
> Es citable: un ítem, un agente o una revisión pueden apoyarse en un principio de acá por su número.
> Este documento **no cita la especificación por número de sección**, porque no está en tu repo:
> cuando una regla del formato hace falta acá, va enunciada.

- **Escrito contra FaLuSpec:** `0.2`
- **Última revisión:** `<fecha>`

---

## 1. Principios

Pocos y peleables. Un principio que nadie discutiría no decide nada; sirve el que descarta opciones
que alguien realmente propondría.

**Entre tres y siete.** Con menos de tres no estás decidiendo nada; con más de siete nadie los tiene
presentes cuando importa, y dejan de operar.

Si el proyecto ya tomó decisiones y las escribió en algún lado, sacalos de ahí. Inventar principios de
estilo produce una lista que suena bien y no descarta nada.

1. `<principio>` — *`<qué descarta>`*
2. `<principio>` — *`<qué descarta>`*
3. `<principio>` — *`<qué descarta>`*

## 2. Prioridades

| Nivel | Significa |
|---|---|
| `P0` | Sin esto, el hito no cierra. |
| `P1` | Se espera para el hito, pero no lo bloquea. |
| `P2` | Vale la pena y no urge. |
| `P3` | Anotado para no perderlo. Puede no hacerse nunca. |

La prioridad es **del ítem respecto del hito**, no una medida de importancia general. Si todo es `P0`,
la escala dejó de informar.

## 3. Definición de listo

Un ítem pasa a `done` cuando:

Los tres primeros los pide el formato y valen para cualquier proyecto. Los del medio son tuyos.

1. Todos sus criterios se cumplen, y cada uno tiene identificador, ancla declarada y verificación
   declarada. Una verificación vale si **puede ponerse en rojo cuando el criterio se incumple**: un
   test que pasaría igual con el problema presente no verifica nada.
2. Su historial registra lo que se decidió y lo que quedó afuera.
3. Su sección `## Impacto` declara qué movió fuera de sus propios criterios —otro ítem cerrado, una
   regla de acá, el comportamiento de un ambiente— o dice «ninguno». La pregunta es obligatoria; la
   respuesta suele ser «ninguno», y ese es el punto.
4. `<paso propio: revisión, build verde, tipos, lint…>`
5. `<paso propio>`

**De `done` no se vuelve.** Si algo cerrado se rompe, es un ítem nuevo con su propio identificador.

### Gate de promoción

`<Qué tiene que ser cierto para que el trabajo salga de donde se hizo — a otra rama, a otro ambiente,
a producción. Si el proyecto no tiene ambientes, borrá esta subsección.>`

## 4. Git

- Ramas: `<esquema>`
- Convención de commits: `<tipo>(<alcance>): <resumen en imperativo>`
- Tipos permitidos: `<lista>`
- `<Qué está prohibido: commitear directo a una rama, saltear hooks, etc.>`

Los identificadores de FaLuSpec **se citan en los commits**. Es lo que permite ir de un cambio al
criterio que lo justificó, y al revés.

## 5. Herramientas

`<Lenguaje, gestor de paquetes, framework de test, cómo se corre todo. Lo mínimo para que alguien que
llega pueda ejecutar el proyecto.>`

Los tipos de verificación de la especificación se traducen así en este proyecto:

| Tipo | Acá es |
|---|---|
| `unit` | `<comando o convención de archivo>` |
| `integracion` | `<comando; qué dependencias hay que levantar>` |
| `e2e` | `<comando>` |
| `estatica` | `<qué comando chequea el repositorio; dónde corre>` |
| `manual` | Lo comprueba una persona. Registrar quién y cuándo en el historial del ítem. |

**Un tipo puede estar inhabilitado en este proyecto.** Si no existe la herramienta —es común que
`e2e` no exista— escribilo así en vez de inventar un comando:

> `e2e` — **inhabilitado**: este proyecto no tiene runner de end-to-end. Un criterio que lo necesite
> se escribe igual, se marca `manual`, y se anota acá que está esperando la herramienta.

Inventar la traducción es peor que declarar el hueco: el día que alguien confíe en ese comando, no
existe.

## 6. Trabajo con agentes

- Un agente recibe **un identificador** como orden de trabajo, nunca una descripción en prosa.
- Un agente no cambia el estado de un ítem a `done`: propone, y `<quién>` cierra. En un proyecto de
  una sola persona: quien mantiene el repo. El punto no es la jerarquía, es que **cerrar sea un acto
  humano deliberado**.
- Un agente que no puede cumplir un criterio **lo dice y para**; no reinterpreta el criterio para que
  dé verdadero.
- `<Qué puede tocar sin preguntar y qué no.>`

Los agentes disponibles están en `.claude/agents/`.
