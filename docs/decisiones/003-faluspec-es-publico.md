# 003 — FaLuSpec es un framework público

- **Fecha:** 2026-08-26
- **Estado:** decidida
- **Alternativas evaluadas:** framework público · método interno de un repo · dejarlo indefinido

## Contexto

Hasta acá el proyecto se podía leer de dos maneras, y las dos eran compatibles con lo hecho: un
formato para que lo use su autor en sus proyectos, o un framework para que lo use cualquiera. La
diferencia no había hecho falta porque nada de lo construido dependía de ella.

Dejó de ser así en la prueba 005: el gate de la fase 2 —«el validador corre en CI»— quedó bloqueado
porque el CLI no se puede instalar desde ningún lado, y elegir cómo desbloquearlo **exige saber para
quién es esto**.

## Decisión

**FaLuSpec es un framework público: cualquiera puede adoptarlo.**

## Consecuencias

### Inmediatas

- **La fase 3 deja de ser opcional.** Era «publicarlo es decisión de la fase 3»; ahora es el destino
  del proyecto, y la fase 3 pasa a ser la que da sentido a las dos anteriores.
- **El gate de la fase 2 se desbloquea publicando el CLI**, no vendorizándolo. Vendorizar resolvía un
  repo; publicar resuelve el problema.
- **Hace falta un remoto y una licencia.** El repo no tiene ninguna de las dos. Sin licencia, «público»
  es una intención, no un permiso.
- `faluspec` **está libre en npm** (verificado el 2026-08-26).

### La que cambia cómo se trabaja de acá en adelante

**El formato dejó de poder romperse gratis.** Va por la v0.5 y cambió cinco veces en dos días, algunas
de forma incompatible: la 0.4 sacó `Contiene:` del hito, la 0.5 cambió qué es un encabezado válido.
Eso era libre porque el único backlog afectado era propio y tenía nueve ítems.

Con usuarios reales, cada cambio incompatible rompe trabajo ajeno. Política a partir de acá:

- **Antes de 1.0** el formato puede romper compatibilidad, y hay que decirlo en el README sin letra
  chica: quien adopte hoy sabe que va a tener que migrar.
- **Desde 1.0**, un cambio incompatible sube la versión mayor, y el CLI **rechaza explícitamente** un
  backlog de una versión que no entiende en vez de interpretarlo mal. Es la misma regla que §10: no
  adivinar.
- Cada versión del formato dice qué cambió y cómo migrar. La tabla de §11 ya existe; le falta la
  columna de migración.

### La que obliga a reabrir una decisión

**La decisión 002 (CLI en Node/TypeScript) se tomó cuando el único usuario era un monorepo pnpm.** Su
consecuencia declarada —«un proyecto Python o Go tendría un validador que resuelve anclas por texto,
no por símbolo»— pesaba poco entonces y pesa mucho ahora: es ofrecerle a la mitad de los adoptantes
posibles una versión degradada de lo único que distingue al formato.

No se revierte: Node sigue siendo la mejor opción para el CLI en sí. Pero **la resolución de anclas
tiene que poder extenderse por lenguaje**, y eso es diseño, no un pendiente: hoy está adentro del
validador y hay que sacarlo a una interfaz. Queda anotado como trabajo de la fase 3, antes de publicar.

## Abierta, y es la más urgente

**El idioma del formato.** Los campos del encabezado están en español —`epica`, `titulo`, `estado`,
`bloqueado_por`, `depende_de`, `hito`, `ancla`, `verifica`— y los valores, mezclados: los estados ya
están en inglés (`todo`, `wip`, `done`, `blocked`) y los tipos de verificación también, salvo
`integracion` y `estatica`. Hoy se escribe `estado: done`, que no es ninguno de los dos idiomas.

Es la decisión **más difícil de revertir** de todas, porque los nombres de campo quedan escritos en el
backlog de cada proyecto que adopte el formato, y hoy hay **un solo backlog con nueve ítems**. Es la
última ventana en la que cambiarlo es barato.

Se decide antes de publicar, no después.
