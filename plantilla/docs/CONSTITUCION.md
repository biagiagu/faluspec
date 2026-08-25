# Constitución — <Nombre del proyecto>

> **Qué es este documento.** Todo lo que FaLuSpec deliberadamente no define: prioridades, definición
> de listo, flujo de git, herramientas, cómo se trabaja con agentes. La especificación define la forma
> de los documentos; esto define cómo trabaja **este** proyecto.
>
> Es citable: un ítem, un agente o una revisión pueden apoyarse en un principio de acá por su número.

- **Escrito contra FaLuSpec:** `0.2`
- **Última revisión:** `<fecha>`

---

## 1. Principios

Pocos y peleables. Un principio que nadie discutiría no decide nada; sirve el que descarta opciones
que alguien realmente propondría.

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

1. Todos sus criterios se cumplen y son válidos según §2.2 de la especificación: identificador, ancla
   declarada, verificación declarada.
2. `<paso propio: revisión, build verde, tipos, lint…>`
3. `<paso propio>`
4. Su historial registra lo que se decidió y lo que quedó afuera.

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
| `estatica` | `<qué chequeo corre en CI>` |
| `manual` | Lo comprueba una persona. Registrar quién y cuándo en el historial del ítem. |

## 6. Trabajo con agentes

- Un agente recibe **un identificador** como orden de trabajo, nunca una descripción en prosa.
- Un agente no cambia el estado de un ítem a `done`: propone, y `<quién>` cierra.
- Un agente que no puede cumplir un criterio **lo dice y para**; no reinterpreta el criterio para que
  dé verdadero.
- `<Qué puede tocar sin preguntar y qué no.>`

Los agentes disponibles están en `agentes/`.
