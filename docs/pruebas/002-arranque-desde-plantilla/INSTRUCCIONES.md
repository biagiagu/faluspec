# Cómo correr la prueba 002

Cuatro pasos. El [protocolo](PROTOCOLO.md) explica **qué** se mide y por qué; esto es el **cómo**.

---

## Paso 1 — Copiar la plantilla a 011

Desde una terminal Git Bash, **antes** de abrir la sesión nueva. Verificado el 2026-08-26: ninguno de
estos destinos existe todavía en 011, así que nada se pisa.

```bash
cd /c/Proyectos/011-SeguimientoDePedidos

git status                       # tiene que estar limpio
git branch --show-current        # deberías estar en develop
git checkout -b chore/faluspec-arranque

P=/c/Proyectos/013-FaLuSpec/plantilla
cp -r $P/backlog            ./backlog
cp    $P/docs/CONSTITUCION.md  docs/
cp    $P/docs/PLAN.md          docs/
cp -r $P/docs/decisiones       docs/decisiones
cp    $P/README.md             docs/ARRANQUE-FALUSPEC.md
cp    $P/agentes/especificador.md  .claude/agents/
cp    $P/agentes/implementador.md  .claude/agents/
cp    $P/agentes/verificador.md    .claude/agents/

git add -A && git commit -m "chore: copiar la plantilla FaLuSpec"
```

Anotá la hora. Ése es el arranque del reloj.

> **Por qué el README de la plantilla va a `docs/ARRANQUE-FALUSPEC.md`:** la plantilla asume que se
> copia a un repo vacío, y su README ocuparía la raíz — donde 011 ya tiene el suyo. Es el primer
> hallazgo de esta prueba y salió antes de empezar: **la plantilla no contempla instalarse en un
> proyecto que ya existe.** Queda anotado; no lo arregles ahora.

## Paso 2 — Abrir 011 en el IDE y una sesión nueva de Claude

Sesión limpia. **No pegues el prompt de continuación de FaLuSpec ni le cuentes esta conversación**:
parte de lo que se prueba es si la plantilla se explica sola. Tampoco le des acceso al repo de
FaLuSpec — si le hace falta la especificación y no la tiene, eso es exactamente el dato que buscamos.

## Paso 3 — Pegarle esto

```
Voy a organizar el trabajo pendiente de este proyecto con un formato de especificación
llamado FaLuSpec. Acabo de copiar su plantilla al repo.

Leé en este orden:
1. docs/ARRANQUE-FALUSPEC.md — cómo se usa la plantilla
2. docs/CONSTITUCION.md, docs/PLAN.md y backlog/ — los formularios a completar
3. .claude/agents/especificador.md — cómo se escriben los ítems

El trabajo a especificar es la parametrización pendiente de cliente. Este repo deriva de
otro proyecto del mismo producto para otro cliente, y quedaron valores heredados sin
confirmar. Buscá `TODO(cliente)` y `CLIENTE.com.ar`, y leé
docs/operacion/BASE_PARA_NUEVO_PROYECTO.md.

Hacé esto, en orden, parando entre paso y paso para que lo revise:

1. Completá docs/CONSTITUCION.md con lo que este proyecto YA hace: está en CLAUDE.md,
   docs/ESTRATEGIA_GIT.md y docs/. No inventes nada; si algo no está definido en ningún
   lado, preguntame.
2. Escribí un hito en docs/PLAN.md.
3. Escribí la épica E19 y sus ítems en backlog/. E19 es la primera épica libre.
   El backlog viejo (docs/BACKLOG.md) queda CONGELADO como histórico: no lo toques,
   no lo migres, no lo actualices.
4. Implementá y cerrá un ítem de verdad: que producción no arranque si GOOGLE_HD sigue
   siendo el placeholder CLIENTE.com.ar. Código, test que corra en verde, y el ancla del
   criterio apuntando al símbolo.
5. Corré el agente verificador sobre backlog/ y pegame su reporte.
6. Borrá los archivos que empiezan con _ en backlog/ y docs/decisiones/.

Mientras trabajás, llevá una bitácora en docs/BITACORA-ARRANQUE.md. Anotá una línea cada
vez que: dudes de cómo escribir algo, te falte una regla que la plantilla no da, tengas
que decidir algo que ella deja abierto, o te haga falta consultar la especificación del
formato (que NO tenés acá). Me sirve tanto tu fricción como tu resultado.
```

## Paso 4 — Volver acá con la bitácora

Cuando termine, anotá la hora de cierre y volvé al repo de FaLuSpec con:

- `docs/BITACORA-ARRANQUE.md` — la fricción que anotó el agente
- El reporte del verificador
- Tus propias notas: dónde te trabaste vos, qué te preguntó que la plantilla debería haber
  respondido, y **cuánto tardó en total**

Con eso se escribe el `HALLAZGOS.md` de esta prueba y se decide si el gate pasó.

---

## Lo que NO tenés que hacer

- **No arregles la plantilla mientras corrés la prueba.** Ni la de FaLuSpec ni la copia en 011. Si
  algo está mal, se anota y se sigue. Corregir sobre la marcha es dejar de medir.
- **No migres el backlog viejo.** Son 18 épicas y no es lo que se está probando.
- **No le expliques el formato al agente.** Si te pregunta algo que la plantilla debería contestar,
  contestale lo mínimo, y **anotá que tuviste que hacerlo**. Eso es un hallazgo.
- **No mergees a `develop`** hasta decidir si el resultado se conserva.
