# Agentes

Tres agentes que operan sobre el formato: uno escribe la especificación, uno la implementa, uno la
audita. Están escritos contra FaLuSpec, no contra un stack: no nombran lenguaje, framework ni
herramienta de test. Eso lo aporta `docs/CONSTITUCION.md`, que los tres citan.

| Agente | Recibe | Devuelve |
|---|---|---|
| `especificador` | una necesidad en prosa | ítems y criterios bien formados |
| `implementador` | un identificador | código, tests y anclas completas |
| `verificador` | nada, o un identificador | los incumplimientos que encontró |

**Si usás Claude Code**, copialos a `.claude/agents/`. El frontmatter ya tiene el formato que espera.

La división no es decorativa. El especificador **no implementa**, así que no puede ablandar un
criterio para que sea más fácil de cumplir. El implementador **no edita criterios**, así que no puede
redefinir el trabajo mientras lo hace. El verificador **no arregla nada**, así que no tiene motivo
para minimizar lo que encuentra.
