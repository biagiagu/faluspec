# Agentes

Cuatro agentes que operan sobre el formato: uno decide qué construir, uno escribe la especificación,
uno la implementa, uno la audita. Están escritos contra FaLuSpec, no contra un stack: no nombran lenguaje, framework ni
herramienta de test. Eso lo aporta `docs/CONSTITUCION.md`, que los tres citan.

| Agente | Recibe | Devuelve |
|---|---|---|
| `product-owner` | una necesidad, o una pregunta de alcance | hitos, épicas e ítems con su prioridad |
| `especificador` | un ítem sin criterios | criterios con ancla y verificación |
| `implementador` | un identificador | código, tests y anclas completas |
| `verificador` | nada, o un identificador | los incumplimientos que encontró |

Viven en `.claude/agents/` porque es donde Claude Code los descubre. Si usás otra herramienta,
movelos donde corresponda y corregí la referencia en `docs/CONSTITUCION.md` §6.

La división no es decorativa, y no viene del organigrama: **cada agente existe porque hay algo que no
debe poder hacerse junto con otra cosa.**

El product owner **no escribe criterios**, así que el alcance no se decide por la ventana mientras
alguien redacta. El especificador **no decide alcance ni prioridad**, así que no puede ablandar un
criterio ni meter producto para que le salga más fácil. El implementador **no edita criterios**, así
que no puede redefinir el trabajo mientras lo hace. El verificador **no arregla nada**, así que no
tiene motivo para minimizar lo que encuentra.

Ése es también el criterio para agregar uno nuevo: la pregunta no es *¿este rol existe en la
industria?* sino **¿qué tiene que poder hacer este que otro no debe poder hacer?** Un agente que no
separa ningún poder es un puesto de organigrama pegado a un prompt.
