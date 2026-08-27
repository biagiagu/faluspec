# 002 — El CLI se escribe en Node/TypeScript

- **Fecha:** 2026-08-26
- **Estado:** **propuesta** — falta confirmación del dueño del proyecto
- **Alternativas evaluadas:** Node/TypeScript · Python · Go · no hacer CLI

## Contexto

La fase 2 es el CLI (`validate` · `init` · `map` · `status` · `archive`), y el lenguaje quedó
explícitamente sin comprometer desde la fundación del repo: «Node/TypeScript es lo natural por el
resto del ecosistema, pero no está comprometido».

Ahora hay que decidirlo, y hay más información que entonces. Las fases 0 y 1 dejaron tres datos que no
existían al principio:

1. **El formato ya no necesita un parser de YAML.** La v0.5 (§3.6) define el encabezado como un
   subconjunto propio que se lee con cinco líneas en cualquier lenguaje. Eso **quita peso** al
   argumento de ecosistema: no hay que elegir un lenguaje por sus librerías.
2. **La parte cara del CLI no es leer el backlog: es resolver anclas.** La única vista que falta
   —cobertura por criterio— exige abrir el código del proyecto y encontrar un símbolo. Eso es lo que
   determina el lenguaje, no el parser.
3. **El CLI tiene que correr en el CI del proyecto que lo adopta**, no en el de FaLuSpec. Es un
   invitado en repos ajenos.

## Qué se encontró

**Los scripts de prueba se escribieron en Python** y funcionaron sin fricción. No es evidencia a
favor: eran desechables, sin dependencias, y no resuelven anclas. Confundir eso con una prueba de
lenguaje sería el mismo error que promoverlos a CLI.

**El costo real está en el punto 2.** Resolver `archivo.ext#simbolo` para un lenguaje arbitrario es un
problema abierto; hacerlo bien para TypeScript/JavaScript es un problema resuelto, porque el
compilador de TypeScript expone su AST como librería. Un CLI en Node puede resolver anclas de verdad
en proyectos TS/JS —que son los que hoy usan FaLuSpec— y caer a una heurística textual para los demás.
Desde Python habría que reimplementar eso o invocar herramientas externas.

**El punto 3 corta para el mismo lado en este caso concreto.** El proyecto que hoy usa el formato es
un monorepo pnpm con CI en Node: un CLI publicado en npm se agrega con una línea y `npx`. Pedirle a
ese CI que instale Python es fricción que no compra nada.

## Decisión

**Node/TypeScript.**

**Se toma:** el CLI se distribuye por npm y se corre con `npx`, sin instalación previa. El validador
usa el AST de TypeScript para resolver anclas en proyectos TS/JS.

**No se toma:** hacerlo agnóstico de lenguaje desde el día uno. La resolución de anclas es
**específica por lenguaje** y no tiene sentido fingir lo contrario: el CLI resuelve bien TS/JS, y para
el resto declara honestamente que su chequeo de anclas es textual. Prometer soporte universal sería
exactamente el tipo de mentira que este formato existe para evitar.

## Consecuencias

- **FaLuSpec queda atado a que el proyecto adoptante tolere Node**, aunque el formato en sí siga siendo
  archivos de texto que cualquiera puede leer. El formato es portable; la herramienta, no. Conviene que
  esa distinción quede escrita: **el formato no depende del CLI**, y un proyecto puede usarlo entero
  sin instalar nada, como se hizo durante las fases 0 y 1.
- Un proyecto Python o Go que adopte FaLuSpec va a tener un validador que resuelve sus anclas por
  texto, no por símbolo — es decir, con la debilidad que la decisión 001 quiso corregir. Si eso pasa,
  es motivo para escribir un resolvedor por lenguaje, no para cambiar de decisión.
- Hay que decidir empaquetado y nombre en npm antes de publicar, y publicar es decisión de la fase 3.

## Pendiente de confirmación

Esta decisión **no está ejecutada**. Nada del CLI está escrito. Si preferís Python o Go, el único
argumento que hay que responder es el punto 2 —cómo se resuelven las anclas— y el resto de la fase 2
no cambia.
