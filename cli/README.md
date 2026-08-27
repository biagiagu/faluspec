# faluspec

CLI del formato. Hoy hace una sola cosa: `validate`.

```bash
pnpm install
pnpm build
node dist/cli.js validate <directorio del proyecto>
```

El proyecto tiene que tener un `backlog/` y un `.faluspec` en su raíz. **Si falta el `.faluspec`, el
comando falla y dice cómo crearlo**: no adivina la versión, porque adivinar mal produce un resultado
que parece correcto (§10 de la especificación).

Códigos de salida: `0` sin errores · `1` con errores · `2` no se pudo ni empezar.

## Qué comprueba hoy

Todo lo que se puede leer del backlog sin abrir el código del proyecto: la gramática de los
identificadores y su unicidad, los campos obligatorios, las dependencias —que existan y que no formen
ciclos—, los estados y sus exigencias (`fecha_estado`, `bloqueado_por`, el impacto declarado en
`done`), el subconjunto del encabezado (§3.6), y las reglas de los criterios de un ítem cerrado.

## Qué le falta

- **Resolver anclas**: comprobar que `archivo.ts#simbolo` exista de verdad. Es la parte cara y la que
  ata este CLI a TypeScript (decisión 002). Sin esto, la validación no cubre la razón de ser del
  formato.
- La comprobación de que un `hito` declarado exista, que necesita leer el plan además del backlog.
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
