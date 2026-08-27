# Prompt para nueva sesión — FaLuSpec

---

## ▼ COPIAR DESDE ACÁ ▼

Estoy trabajando en **FaLuSpec**, un formato propio para especificar trabajo de software de modo que
una máquina pueda verificarlo. La **fase 0 está cerrada** y la **fase 1 tiene su gate cumplido**: el
formato va por la **v0.4**, las vistas están definidas, y una de ellas ya se genera y coincide byte a
byte con la escrita a mano. Todavía no hay CLI.

Leé en este orden antes de proponer nada:

1. `README.md` — qué es y el plan de 3 fases con sus gates.
2. `docs/ESPECIFICACION.md` — el formato, hoy en **v0.4**. Es el entregable central de la fase 0.
   `docs/VISTAS.md` — la forma de lo que se genera. Es el entregable central de la fase 1.
3. `docs/decisiones/001-por-que-existe.md` — contra qué se comparó y qué se tomó de cada alternativa.
4. El **Log de sesiones** al final de este archivo — empezá por la entrada de arriba.
5. `docs/pruebas/` — los dos casos reales contra los que se probó el formato, con sus hallazgos.
   **Empezá por `002-arranque-desde-plantilla/HALLAZGOS.md`**: es el gate de la fase 0, ya corrido.
   Es el banco de pruebas: **su contenido no se generaliza a la spec ni se copia a la plantilla.**

**Regla dura del proyecto:** la especificación define *la forma*, nunca *el contenido*. Si una regla
no se puede enunciar sin nombrar un proyecto, un cliente o un stack concreto, no va en la spec.

**Próximo paso — hay que decidir el alcance.** El gate de la fase 1 está cumplido, pero su entregable
no: de las cinco vistas se generó **una**. Las opciones son (a) generar las otras tres derivables
—bloqueos, resumen por épica, story map— con scripts desechables y recién ahí cerrar la fase 1, o
(b) darla por cerrada y arrancar la fase 2, donde el CLI las genera todas de una. Ojo con el sesgo:
`generar-tabla.py` funciona, y eso hace parecer trivial lo que falta.

Antes del CLI hay que cerrar dos decisiones que condicionan el parser: **qué subconjunto de YAML es el
encabezado** (§9.7) y **cómo declara un proyecto su versión de formato** (§9.3).

Y queda una decisión suelta en el proyecto de origen: el trabajo de la prueba 002 sigue en
`011-SeguimientoDePedidos`, rama `chore/faluspec-arranque`, **sin mergear a `develop`**.

## ▲ COPIAR HASTA ACÁ ▲

---

## Resumen permanente

**Qué es.** Un formato para especificar trabajo de software que produce requisitos verificables por
máquina, no sólo legibles por humanos. La diferencia con todo lo demás del nicho: cada criterio sabe
**dónde vive en el código** (ancla a un símbolo) y **con qué se comprueba** (estrategia de test).

**De dónde salió.** No se diseñó de cero: se destiló de una forma de trabajo que ya funcionaba en dos
proyectos reales. El proyecto de origen es `c:\Proyectos\011-SeguimientoDePedidos` — sirve como
referencia y banco de pruebas, pero **su contenido no se copia acá**: se extrae el patrón.

**El átomo** (la unidad mínima, de la que se deriva todo lo demás):

```markdown
### E4-07.2 — Reintento con espera creciente

**Dado** un envío que falló por error de red, **cuando** el reintento se programa,
**entonces** la espera es el doble de la anterior, con un techo de 30 minutos.

- ancla: `src/notificaciones/reintento.ts#calcularEspera`
- verifica: `unit` → `reintento.test.ts::espera creciente con techo`
```

**Constructos:** criterio → ítem → épica → hito. Identificadores `E4` / `E4-07` / `E4-07.2` / `H3`.

**Para quién:** equipos chicos y solistas que trabajan con agentes y quieren el plan dentro del repo,
versionado junto al código. No compite con Jira ni Linear.

---

## Stack y decisiones cerradas

### Del proyecto

- **Fase 0 es sólo documentos.** No escribir CLI hasta cerrar el gate de la fase 1. Un validador
  contra un formato que todavía no está definido no valida nada.
- **Lenguaje del futuro CLI: sin decidir.** Node/TypeScript es lo natural por el resto del ecosistema
  del usuario, pero no está comprometido.
- **Rama única: `main`.** Se descartó el esquema `develop → test → main` que el usuario usa en
  proyectos desplegables: esto no tiene ambientes ni deploy. Si en la fase 2 aparece un CLI publicable,
  reevaluar.
- **Sin remoto configurado.** El repo es local. Publicarlo es decisión de la fase 3.

### Del formato (ya tomadas, revisables con argumento)

- **Las anclas apuntan a símbolos, nunca a números de línea.** Decisión fundacional: un símbolo se
  resuelve mecánicamente, una línea se pudre en silencio. Es lo que hace posible el validador, y es
  la corrección principal respecto del método original.
- **Un criterio sin ancla es válido mientras su ítem no esté `done`.** Antes de implementar, exigir
  ancla obliga a inventarla.
- **`verifica: manual` es un valor legítimo**, no un pendiente. Existe para no mentir en el documento
  y para poder medir qué porcentaje del proyecto depende de verificación humana.
- **Las dependencias pueden cruzar épicas.** Las épicas agrupan por tema, no aíslan.
- **Los identificadores no se reciclan ni se renumeran.** Un hueco es información.
- **De `done` no se vuelve.** Si algo cerrado se rompió, es un ítem nuevo con su propio identificador.
- **Las épicas no tienen estado propio**, se deriva del de sus ítems.

Agregadas en la v0.2, todas salidas de la prueba 001:

- **`estatica` es un tipo de verificación**, para criterios que afirman algo del repositorio y no del
  sistema corriendo. Corre en CI y falla el build.
- **`ancla: ninguna — <motivo>` es una declaración válida**, incluso en `done`. Mismo movimiento que
  `manual`: nombrar lo que no se puede hacer, en vez de dejar un vacío indistinguible de un olvido.
  Tres motivos previstos: el estado vive fuera del repo · el alcance es el repo entero · el trabajo es
  el test mismo.
- **El ancla puede apuntar a un archivo entero** cuando ese archivo no tiene símbolos (binario, config).
  Sólo entonces: si tiene símbolos, hay que nombrar uno.
- **Los símbolos no exportados valen como ancla**, y se admite un nivel de propiedad (`#esquema.CLAVE`).
  Uno solo — más abajo, el ancla se parece a un número de línea.
- **`bloqueado_por` es obligatorio en `blocked`.** Sin él, el bloqueo no es consultable por ninguna vista.

Agregadas en la v0.3, todas salidas de la prueba 002 (usar el formato para trabajar, no para escribir):

- **Un ítem `done` declara su impacto** (§3.5): qué movió fuera de sus propios criterios, o «ninguno».
  El formato verifica lo declarado; sin esta pregunta no hay forma de ver lo que se movió sin declarar.
- **La verificación tiene que poder fallar** si el criterio se incumple. Un test que pasaría igual con
  el problema presente es formalmente válido y materialmente vacío.
- **`estatica` se define por ser un chequeo mecánico sobre el repositorio**, no por correr en CI.
- **Una épica puede declarar `bloqueado_por`.** No es estado: es la causa común, dicha una vez.
- **Se puede nacer en cualquier estado salvo `done`**; `fecha_estado` es «desde cuándo está así».
- **El historial cubre decisiones, no sólo implementación**, y arranca cuando hay algo que registrar.
- **El ancla puede apuntar a un directorio** cuando el criterio habla de un conjunto de archivos.

### Abiertas (ver §9 de la especificación)

Ubicación de los archivos de ítem · criterios compartidos entre ítems · versionado del formato ·
si las prioridades son parte del formato o de cada proyecto · dónde viven la épica y el historial ·
qué régimen de validez tienen los criterios de épica.

Y los cinco hallazgos de la 002 que se dejaron sin resolver a propósito: contradicción entre un
criterio nuevo y un ítem ya cerrado (F3) · cómo exigir que una enumeración sea exhaustiva (F4, puede
no tener respuesta) · distinguir en el diff «completé el ancla» de «cambié el criterio» (F9) · varios
criterios compartiendo un mismo símbolo (F10) · el trabajo que el propio cambio vuelve necesario
(F12).

Las dos primeras siguen abiertas **porque la prueba 001 no dio evidencia**, no por falta de discusión.
La tercera dejó de ser hipotética: ya hay dos versiones del formato, y la segunda acepta cosas que la
primera rechazaría.

### Tomado de otras herramientas

Se evaluaron OpenSpec v1.10.0 y github/spec-kit ejecutando sus CLI. **Se toma:** separación entre
vigente e histórico, validación como comando que falla en CI, constitución de principios, directorio
como unidad de trabajo. **No se toma:** renunciar a la capa de producto, delegar el plan a GitHub,
ciclos de diez comandos.

---

## Log de sesiones

### 2026-08-26 (3) — Las vistas, la v0.4 y el gate de la fase 1

**Qué se hizo.** Arrancó la fase 1. Se escribió `docs/VISTAS.md` —las cinco vistas con sus columnas,
su orden y qué campo alimenta cada celda— y se corrió la prueba 003, que es el gate.

**El gate pasa.** La tabla de `E19` generada desde los nueve ítems coincide **byte a byte** con la
escrita a mano. La tabla a mano se commiteó **antes** que el generador, para poder afirmarlo.

**Lo que cambió el formato (v0.4).** Definir las vistas destapó que la relación entre ítem e hito **no
era derivable**: el hito declaraba su contenido en prosa («E6 sin el heatmap» no dice qué ítems son).
Ahora la relación vive en el ítem, en el campo `hito`, y el hito dejó de llevar su lista de contenido
—conserva su significado, que es lo único que una máquina no puede derivar—. Primer cambio del formato
que no salió de escribir ni de implementar, sino de **intentar generar algo**.

**Lo que costó llegar al byte a byte.** La primera corrida falló con el contenido correcto: la consola
de Windows lo codificó en cp1252. Y con `core.autocrlf=true` y sin `.gitattributes`, regenerar una
vista da diff falso siempre. **El gate habría fallado por motivos que no tienen nada que ver con el
backlog.** `VISTAS.md` ganó la regla 7 (UTF-8 sin BOM, LF) y la plantilla trae `.gitattributes`.

Otro hallazgo que sólo aparece escribiendo el generador: **«ordenado por identificador» es ambiguo y
la respuesta obvia es la incorrecta** — como texto, `E19-01` va antes que `E4-07`.

**Lo que el gate NO probó**, y está escrito en los hallazgos para que no se sobrevenda: una sola
épica, sin huecos de numeración, una sola de las cinco vistas, nueve ítems.

**Pendiente.** Decidir el alcance del cierre de la fase 1 (ver «Próximo paso»).

**Estado del repo.** `main`, sin remoto.

### 2026-08-26 (2) — Especificación v0.3 y plantilla arreglada · fase 0 cerrada

**Qué se hizo.** Movimiento 6: se aplicaron los hallazgos de la prueba 002 y **se cerró la fase 0**.

**Formato → v0.3.** Entraron los cinco con consecuencia sobre el validador, más dos que salían gratis:

- **§3.5, el impacto declarado** — un ítem `done` dice qué movió fuera de sus criterios, o «ninguno».
  Es la respuesta al agujero más grande de la 002: el formato verifica lo declarado y no tiene forma
  de ver lo que se movió sin declarar. Lo que no se pregunta no se responde.
- **Regla de validez 6** — la verificación tiene que **poder fallar** si el criterio se incumple. Sale
  del caso del test que hacía `count(*) > 0` en un criterio que exigía otra cosa: formalmente válido,
  materialmente vacío.
- **`estatica` se define por lo que es**, un chequeo mecánico sobre el repositorio, y no por dónde
  corre.
- **`bloqueado_por` de épica** (que no es estado, es la causa común dicha una vez).
- **Se puede nacer en cualquier estado salvo `done`**, y `fecha_estado` es «desde cuándo está así».
- **El historial arranca cuando hay algo que registrar**, no con la implementación.
- **Ancla a directorio**, cuarta forma.

**Sin resolver a propósito: F3, F4, F9, F10, F12** — quedan anotados en el HALLAZGOS de la 002. F4 (no
hay forma de exigir exhaustividad) puede no tener respuesta nunca.

**Plantilla: los once.** Los tres que importan: los agentes se mudaron a `.claude/agents/`, que es
donde la herramienta los busca; el README ganó sección de instalación con el caso «repo que ya
existe»; y la constitución **dejó de citar la especificación por número de sección**, porque la spec no
viaja con la plantilla y quien la use no puede leerla.

**Pendiente.** El trabajo de la prueba 002 sigue en `011-SeguimientoDePedidos`, rama
`chore/faluspec-arranque`, sin mergear. `E19-01` tapa un agujero de despliegue real, así que
probablemente convenga conservarlo — pero es decisión de ese proyecto, no de éste.

**Próximo paso.** Fase 1.

**Estado del repo.** `main`, sin remoto.

### 2026-08-26 — El gate de la fase 0, cumplido

**Qué se hizo.** Se corrió la prueba 002 en `011-SeguimientoDePedidos`: sesión limpia, sin acceso al
repo de FaLuSpec, sin que nadie explicara el formato. **Una hora.** El resultado se verificó contra los
archivos, no contra el reporte: constitución completa, hito con significado, épica `E19` con 9 ítems,
`E19-01` cerrado con su ancla resolviendo y 211 tests en verde, verificador corrido, formularios
borrados.

**El gate pasó.** Con una salvedad declarada en los hallazgos: 011 ya tenía escrita casi toda la
información que pide la constitución, así que la hora es un **piso optimista**. Lo que sí quedó
probado sin asteriscos es que **la plantilla se explica sola**.

**Lo que valió más que el gate.** Tres cosas que ninguna discusión de diseño habría producido:

1. **El verificador encontró cuatro criterios cuya verificación no verificaba lo que el criterio
   afirma** — apuntaban a un test que sólo hace `count(*) > 0`. Habrían cerrado en verde con el
   problema intacto. Obligar a nombrar el test antes de tiempo fue lo que lo hizo visible.
2. **Un ítem cerró correctamente y movió el gate de promoción sin declararlo.** Todos sus criterios en
   verde, auditado, y aun así cambió una regla del proyecto que nadie va a ver. Es el agujero más
   grande que encontró la prueba (F1).
3. Un criterio **evitó una mala decisión de implementación** antes de que se le ocurriera a nadie.

**Qué quedó.** 12 hallazgos de formato y 11 de plantilla, en
`docs/pruebas/002-arranque-desde-plantilla/HALLAZGOS.md`. La bitácora original —31 entradas escritas
durante el arranque, no después— está copiada al lado como evidencia.

**Pendiente.** Nada bloqueante. El trabajo quedó en 011, rama `chore/faluspec-arranque`, **sin
mergear a `develop`**: falta decidir si se conserva. Ojo que `pnpm format:check` de ese repo ya venía
fallando de antes, y tres de los archivos en rojo eran de esta plantilla.

**Próximo paso.** Movimiento 6: aplicar los hallazgos antes de cerrar la fase 0.

**Estado del repo.** `main`, sin remoto.

### 2026-08-25 (4) — La plantilla

**Qué se hizo.** Movimiento 4. `plantilla/` estaba vacía y ahora tiene los tres documentos que un
proyecto nuevo necesita antes de escribir su primer ítem, los formularios del formato, un ejemplo
completo y tres agentes.

```
plantilla/README.md            instrucciones de arranque, en 6 pasos
plantilla/docs/CONSTITUCION.md principios · prioridades · DoD · git · herramientas · agentes
plantilla/docs/PLAN.md         los hitos, definidos por significado
plantilla/docs/decisiones/     formulario de decisión
plantilla/backlog/             formularios de épica e ítem + un ejemplo cerrado, con historial
plantilla/agentes/             especificador · implementador · verificador
```

**La decisión de diseño.** Los agentes están **separados por lo que no pueden hacer**, y esa es toda
la gracia: el especificador no implementa (no puede ablandar un criterio para que le salga más
fácil), el implementador no edita criterios (no puede redefinir el trabajo mientras lo hace), el
verificador no arregla nada (no tiene motivo para minimizar lo que encuentra). El verificador hace a
mano el trabajo del validador de la fase 2 — la plantilla es usable hoy, sin herramientas.

**Qué eligió la plantilla que la spec deja abierto.** Ítems en `backlog/` plano · la épica como
archivo junto a sus ítems · el historial como última sección del ítem · prioridades P0–P3. Están
declaradas como elección de la plantilla, en una tabla de su README, con cuándo conviene cambiarlas.

**Qué volvió a la spec.** Las dos del medio **no son decisiones de cada proyecto: son huecos del
formato**. §3.1 dice que un ítem es un archivo, pero §4 no dice si la épica lo es, y §3.4 manda el
historial «aparte» sin decir aparte dónde. Quedó como decisión abierta §9.5. También se anotó en §9.3
que la constitución ya declara contra qué versión del formato está escrito («escrito contra FaLuSpec:
0.2»), que era justo lo que esa decisión pedía.

**Pendiente.** Nada bloqueante.

**Próximo paso.** El gate: arrancar un proyecto real desde la plantilla y medir cuánto cuesta.

**Estado del repo.** `main`, sin remoto.

### 2026-08-25 (3) — Especificación v0.2

**Qué se hizo.** Se aceptaron y aplicaron los 7 hallazgos de la prueba 001. La spec pasó a **v0.2** y
ganó una §10 con historial de versiones. El caso de prueba se reescribió con la sintaxis nueva, así
que además sirve de ejemplo de las formas que la 0.2 agrega. Qué hallazgo fue a qué sección está en la
tabla al final de `HALLAZGOS.md`.

**Lo que cambió del formato.** Está listado arriba, en «Stack y decisiones cerradas». El resumen: el
formato dejó de suponer que todo criterio vive en un símbolo del repositorio. Hay trabajo real cuyo
estado vive afuera —DNS, consolas de proveedores— o cuyo alcance es el repositorio entero, y la v0.1
sólo lo podía expresar mintiendo o dejando huecos.

**Qué apareció al migrar el caso.** Un hallazgo tardío: las reglas de validez del criterio están
escritas suponiendo que su contenedor es un **ítem**, así que los criterios de épica quedan sin
régimen. Se anotó como decisión abierta §9.5 en vez de resolverlo sobre la marcha.

**Pendiente.** Nada bloqueante.

**Próximo paso.** Movimiento 4: llenar `plantilla/`. Es lo único que falta para el gate de la fase 0.

**Estado del repo.** `main`, sin remoto.

### 2026-08-25 (2) — El formato contra un caso real

**Qué se hizo.** Movimiento 2 de la fase 0. Se escribió la parametrización pendiente de cliente del
proyecto de origen en formato FaLuSpec: 1 épica, 1 hito, 8 ítems, 21 criterios, en
`docs/pruebas/001-parametrizacion-cliente/`. Es un **banco de pruebas**, no la plantilla — está
marcado como tal en su README y nada de ahí se copia a `plantilla/`.

**Qué se encontró.** El formato aguantó: ningún constructo hubo que forzarlo ni inventarlo. Pero el
caso mostró que la v0.1 se escribió pensando en funcionalidad nueva, y esto era configuración sobre
código que ya existe. Salieron 7 huecos, en `HALLAZGOS.md`. Los tres que importan:

1. **Falta el tipo de verificación `estatica`** — hay criterios que se comprueban con un grep en CI y
   no son ni unit, ni integración, ni e2e, ni manual.
2. **Hay criterios sin ancla posible por naturaleza** (DNS, íconos, criterios de alcance repositorio).
   La regla «ítem `done` ⇒ tiene ancla» los volvería invalidables para siempre. La ausencia de ancla
   debería ser un valor declarable, como lo es `manual`.
3. **`blocked` no dice qué se está esperando** — la causa va al historial, así que el bloqueo queda
   fuera de toda vista. Propuesta: campo opcional `bloqueado_por`.

Los otros cuatro: granularidad del ancla dentro de un símbolo · si valen los símbolos no exportados
(hay que decidirlo antes de la fase 2, condiciona el validador) · criterios que afirman algo sobre su
propia suite · `verifica` como encargo de test y no sólo como registro.

**Datos del caso.** 48% de los criterios quedaron en `manual` — confirma que `manual` no es un parche:
sin él, la mitad de esta épica sería inexpresable. 24% sin ancla. El ejercicio produjo 7 nombres de
test que todavía no existen.

**Qué NO se decidió.** La spec sigue en v0.1, sin tocar. Aplicar los hallazgos es el movimiento 3.

**Pendiente.** Resuelto en la sesión siguiente.

**Próximo paso.** Decidir cuáles de los 7 hallazgos entran en la v0.2.

### 2026-08-25 — Fundación del repo

**Qué se hizo.** Se creó el repo desde cero y se escribió la especificación v0.1 del formato
(9 secciones: átomo, ítem, épica, hito, gramática de IDs, estados, fuente vs. vistas, decisiones
abiertas), el README con el plan de 3 fases, y el registro de decisión 001.

**Cómo se llegó acá.** La sesión arrancó evaluando si adoptar OpenSpec o Spec Kit en el proyecto de
origen. Al auditar el método propio se encontró que su formato de criterios ya era **más rico** que el
de ambas herramientas —identificador de tercer nivel, ancla al código, estrategia de test—, así que
adoptarlas habría sido perder información. De ahí salió la idea de formalizarlo como formato propio.
Las tres piezas de análisis están enlazadas en `docs/decisiones/001-por-que-existe.md`.

**Qué se decidió.** Repo separado del proyecto de origen: la separación física es lo que hace cumplible
la regla de no mezclar forma con contenido. Nombre elegido: FaLuSpec. Las decisiones del formato están
listadas arriba en «Stack y decisiones cerradas».

**Pendiente.** Nada bloqueante.

**Próximo paso.** Movimiento 2 de la fase 0: escribir la parametrización pendiente de cliente del
proyecto de origen como ítems y criterios en el formato nuevo. Es trabajo real, hoy sólo prosa suelta,
y sin dependencias con identificadores existentes. Si el formato no lo banca, mejor descubrirlo ahora
que con cincuenta ítems migrados.

**Estado del repo.** `main`, commit inicial `dd4e419` con los 9 archivos. Working tree limpio.
Sin remoto.
