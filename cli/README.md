# faluspec

CLI del formato.

```bash
npx faluspec init .          # deja la plantilla en el proyecto, sin pisar nada
npx faluspec validate .      # valida el backlog y comprueba que cada ancla resuelva
```

Códigos de salida de `validate`: `0` sin errores · `1` con errores · `2` no se pudo ni empezar.

## `init`

Deja la plantilla en un proyecto y **no pisa nada**: si un archivo ya existe, lo dice y sigue. Un
proyecto que ya existe es el caso normal, no la excepción, y perder el README de alguien por instalar
una herramienta sería imperdonable. Correrlo dos veces es inofensivo.

El README de la plantilla va a `docs/ARRANQUE-FALUSPEC.md`, no a la raíz — ahí ya está el del
proyecto.

## Desarrollo

```bash
pnpm install
pnpm test
pnpm build && node dist/cli.js validate <directorio>
```

El proyecto tiene que tener un `backlog/` y un `.faluspec` en su raíz. **Si falta el `.faluspec`, el
comando falla y dice cómo crearlo**: no adivina la versión, porque adivinar mal produce un resultado
que parece correcto (§10 de la especificación).

## Qué comprueba hoy

**Del backlog:** la gramática de los identificadores y su unicidad, los campos obligatorios, las
dependencias —que existan y que no formen ciclos—, los estados y sus exigencias (`fecha_estado`,
`bloqueado_por`, el impacto declarado en `done`), el subconjunto del encabezado (§3.6), y las reglas de
los criterios de un ítem cerrado.

**Del código: que cada ancla resuelva** (§2.2 regla 4). Es lo que ninguna otra herramienta del nicho
puede hacer, porque ninguna otra guarda dónde vive cada criterio. Un ancla que dejó de resolver
significa que el código se movió y la especificación quedó mintiendo.

| Forma del ancla | Cómo se comprueba |
|---|---|
| `archivo.ts#simbolo` | Se parsea el archivo y se buscan sus declaraciones. **Los símbolos no exportados cuentan.** |
| `archivo.ts#simbolo.propiedad` | Un nivel de punto: claves de un objeto literal, miembros de una clase |
| `archivo.ext` | Vale sólo si el archivo no tiene símbolos que nombrar |
| `directorio/` | Con la barra final. Sin ella se busca un archivo, y no lo encuentra |
| `ninguna — motivo` | Con motivo. Sin él no se distingue de un olvido |
| Otros lenguajes | Coincidencia textual, **declarada como aproximada** en la salida |

La resolución no necesita que el proyecto compile: parsea cada archivo suelto. Un ancla tiene que
poder comprobarse aunque el código esté roto — de hecho es cuando más importa.

## Qué le falta

- La comprobación de que un `hito` declarado exista, que necesita leer el plan además del backlog.
- Que la verificación nombrada exista como test.
- `init`, `map`, `status`, `archive`.

## Cómo está organizado

```
src/formato/encabezado.ts   el subconjunto de §3.6 — lee y, sobre todo, rechaza lo que queda afuera
src/formato/backlog.ts      lee un directorio: épicas, ítems, criterios. No juzga
src/reglas/estructura.ts    las reglas que no necesitan tocar el código. No arreglan: reportan
src/cli.ts                  el comando
```

La separación entre leer, juzgar y arreglar es la misma que entre los tres agentes de la plantilla, y
por el mismo motivo: quien lee no debería tener opinión, y quien juzga no debería poder tapar lo que
encuentra.
