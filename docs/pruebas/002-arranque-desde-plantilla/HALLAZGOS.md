# Hallazgos de la prueba 002 — el gate de la fase 0

**Corrida:** 2026-08-26 · proyecto `011-SeguimientoDePedidos` · plantilla FaLuSpec `0.2` · sesión
limpia, sin acceso al repo de FaLuSpec.

**Tiempo total: ~1 hora.** El gate pedía «horas». **Pasó.**

Evidencia: [`BITACORA.md`](BITACORA.md), 31 entradas de fricción escritas durante el arranque, no
después.

---

## La línea de llegada, verificada

Comprobada contra los archivos, no contra el reporte de quien la corrió.

| | Resultado |
|---|---|
| `CONSTITUCION.md` sin huecos | ✅ |
| Un hito con significado, no lista de entregables | ✅ `H1 — La app es de este cliente`, con regla de decisión explícita |
| Épica y ≥3 ítems con criterios completos | ✅ `E19` con 9 ítems — 7 `blocked`, 1 `done`, 1 `todo` |
| **Un ítem en `done` de verdad** | ✅ `E19-01`, ancla `#GOOGLE_HD_PLACEHOLDER` que resuelve · **211 tests en verde, verificado por un tercero** |
| Verificador corrido | ✅ y encontró cuatro defectos reales |
| Formularios borrados | ✅ |

### La salvedad que hay que declarar

**La hora medida es un piso optimista, no el número del gate.** 011 ya tenía escrita, dispersa, casi
toda la información que pide la constitución: `CLAUDE.md`, `ESTRATEGIA_GIT.md`, `BASE_PARA_NUEVO_PROYECTO.md`.
Un proyecto que arranca de cero tiene que **decidir** eso, no transcribirlo. La prueba mide el costo
de instalar el formato, no el de tomar las decisiones que el formato exige.

Lo que sí quedó probado sin asteriscos: **la plantilla se explica sola.** Corrió sin acceso a la
especificación y sin que nadie le explicara el formato, y produjo un backlog válido.

---

## Lo que el formato hizo bien, y no era obvio

Tres cosas pasaron que ninguna discusión de diseño habría producido.

### 1 · Nombrar el test antes de tiempo destapó cuatro verificaciones falsas

El verificador encontró que **cuatro criterios declaraban una verificación que no verifica lo que el
criterio afirma** (`E19.a`, `E19.b`, `E19-03.1`, `E19-04.1`). Apuntaban a un test que sólo hace
`count(*) > 0`, en ítems que exigen «cada depósito con su ciudad, sin nombres genéricos». **Habrían
cerrado en verde con el problema intacto.**

De la bitácora: *«el formato me hizo escribir el nombre del test antes de tiempo, y eso mismo hizo
visible que el test no alcanzaba. Sin la obligación de nombrarlo, esto se descubría al implementar, o
nunca.»*

Es la tesis del formato funcionando, y salió de la regla que la v0.2 acababa de agregar (§2.4, «la
verificación se escribe antes de implementar»).

### 2 · Un criterio evitó una mala decisión de implementación

`E19-01.3` exige que el guard mire el placeholder concreto y no la forma del dominio. Quien
implementaba iba a validar con una expresión regular; el criterio ya decía que no, escrito antes de
que se le ocurriera.

### 3 · La separación de agentes hizo su trabajo

El verificador encontró defectos en criterios que el mismo modelo había escrito veinte minutos antes.
Auditar sin poder arreglar —y sin haber implementado— es lo que lo hizo posible.

---

## Hallazgos sobre el formato

Ordenados por peso. Los cuatro primeros son los que justifican una v0.3.

### F1 · Un ítem puede cerrar en verde y haber movido una regla del proyecto sin declararlo

`E19-01` cerró con sus cuatro criterios cumplidos y auditados. Y de paso **cambió el gate de
promoción**: el guard bloquea `NODE_ENV=production`, y el ambiente de test corre así. Ningún criterio
lo decía. Quedó registrado sólo porque quien implementaba lo consideró honesto.

De la bitácora: *«un ítem puede estar completo, auditado y verde, y haber cambiado una regla del
proyecto que nadie va a ver.»*

El formato verifica que se cumpla lo declarado. No tiene forma de detectar **lo que se movió sin
declarar**. Es el agujero más grande que encontró esta prueba.

**Propuesta:** que el DoD del formato —no el de cada proyecto— incluya un paso de impacto: qué de la
constitución, de otro ítem `done` o de otro ambiente quedó afectado. Una línea, y vacía cuando no hay
nada. Lo que no se pregunta no se responde.

### F2 · Una verificación puede no verificar el criterio, y el formato no lo impide

El caso del `count(*) > 0`. Hoy §2.2 exige que la verificación **declare un tipo** y que el test
exista. No exige que el test **pueda distinguir el caso que el criterio prohíbe**.

**Propuesta:** regla de validez nueva — la verificación tiene que poder fallar si el criterio se
incumple. Es informal de validar automáticamente, pero es exactamente lo que un auditor puede chequear,
y esta prueba mostró que lo encuentra.

### F3 · Un criterio nuevo puede contradecir a un ítem ya cerrado

`E19.a` pedía que un `grep` de placeholders no devolviera nada — imposible, porque el placeholder
tiene que sobrevivir en la constante del guard de `E19-01`, que ya estaba `done`. **Nada en el formato
lo impide en el momento de escribirlo.** Sólo se ve auditando.

**Propuesta:** al escribir un criterio, contrastarlo contra lo ya cerrado. Es trabajo del validador de
la fase 2, pero la regla tiene que existir antes.

### F4 · No hay forma de exigir que una lista esté completa

El criterio de erradicación buscaba el placeholder que su autor conocía. Había **un segundo**
(`seguimiento.tudominio.com`) y el chequeo daba verde igual. El formato pide que el criterio sea
verificable; no tiene forma de decir «acá la enumeración tiene que ser exhaustiva».

**Propuesta:** ninguna todavía. Es un límite real de cualquier criterio escrito a mano, y conviene
anotarlo antes que inventarle sintaxis.

### F5 · `estatica` quedó atada a CI, y hay comandos reproducibles que no corren en CI

Un `grep` que devuelve líneas o no devuelve nada no es `manual` —nadie juzga— pero tampoco es
`estatica` si esa se define como «corre en CI». La 001 pidió el tipo; la 002 muestra que su
definición quedó apretada.

**Propuesta:** definir `estatica` por lo que es —un chequeo mecánico sobre el repositorio— y no por
dónde corre. Que corra en CI es una recomendación del proyecto, no parte del tipo.

### F6 · Un bloqueo compartido por toda una épica no es expresable

Siete de nueve ítems `blocked` esperando lo mismo, de la misma persona. El formato obliga a repetir el
motivo siete veces, y **la información más importante de la épica —que está enteramente parada— sólo
se ve leyendo los siete archivos**. El lugar natural sería la épica, pero las épicas no tienen estado.

**Propuesta:** permitir `bloqueado_por` a nivel épica. No es estado —no se deriva ni contradice a los
ítems—, es la causa común. Cada ítem puede seguir teniendo el suyo.

### F7 · No está dicho si un ítem puede nacer `blocked`, ni qué significa `fecha_estado`

Siete ítems nacieron bloqueados: es su estado honesto el día que se escriben, y ponerlos en `todo`
diría que alguien podría empezarlos. Pero §7 dibuja `blocked` como un estado al que se llega.

Y `fecha_estado` es ambiguo: ¿desde cuándo está en este estado, o cuándo se lo pasó a él? Para un ítem
nacido bloqueado son la misma; para el resto, no.

**Propuesta:** decir explícitamente que se puede nacer en cualquier estado salvo `done`, y definir
`fecha_estado` como «desde cuándo está así».

### F8 · El historial de decisiones no es el historial de implementación

`especificador.md` prohíbe escribir historial en un ítem recién creado —«todavía no pasó nada»— pero
sí pasó: **por qué el ítem está bloqueado y qué se descartó al escribirlo**. Se escribió igual, en
cinco ítems, contra la regla.

Lo mismo al corregir criterios de ítems abiertos: sin registro, el diff no distingue una corrección de
la especificación de un cambio de alcance.

**Propuesta:** el historial arranca cuando hay algo que registrar, no cuando empieza la
implementación. §3.4 tiene que decir que cubre las dos cosas.

### F9 · Completar un ancla y cambiar un criterio se ven igual en el diff

El formato **obliga** a completar el ancla al implementar y **prohíbe** editar el criterio. Las dos
cosas son un cambio en el mismo archivo, indistinguibles para quien revisa.

### F10 · Varios criterios sobre el mismo símbolo informan menos de lo que parece

Tres de los cuatro criterios de `E19-01` anclan a `#apiEnvSchema`, porque el guard son cuatro líneas
dentro de una función de veinte. **La granularidad del código es más gruesa que la de los criterios**,
y el ancla deja de discriminar. Es el mismo eje que el hallazgo 3 de la prueba 001, visto desde el
otro lado: allá el ancla era demasiado gruesa para el criterio; acá lo es para tres a la vez.

### F11 · El ancla a un directorio no está contemplada

`apps/web/public` no es archivo ni símbolo. Las tres formas de §2.3 no lo cubren; las alternativas
—listar cinco anclas, o `ninguna`— mienten más.

### F12 · El trabajo que el propio cambio vuelve necesario no tiene lugar

Cinco tests existentes dejaron de ser válidos al implementar `E19-01`. Sin arreglarlos el pipeline
queda rojo, así que no es opcional; pero tampoco está en ningún criterio, y `implementador.md` dice
«no metés trabajo que nadie pidió». La regla contempla el trabajo *extra*, no el trabajo *implicado*.

---

## Hallazgos sobre la plantilla

Baratos de arreglar, y todos hacen tropezar al siguiente que la use.

| # | Qué pasó | Arreglo |
|---|---|---|
| P1 | **La plantilla cita la especificación por número de sección, y la especificación no está en el repo.** Hubo que reconstruir §2.2 desde `especificador.md`: *«si mi reconstrucción está mal, todos los ítems quedan mal en el mismo eje y nadie lo nota»* | Enunciar la regla en vez de citarla, o incluir una copia de la spec en la plantilla |
| P2 | `agentes/` colisiona con `.claude/agents/`, que es lo único que la herramienta descubre | Poner los agentes donde la herramienta los busca, y que el README lo diga |
| P3 | La plantilla no dice nada sobre **su propia instalación**: en qué rama, ni qué pasa si el repo ya existe (su README pisaría el del proyecto) | Una sección de instalación, con el caso «repo que ya existe» |
| P4 | Asume que **los cinco tipos de verificación existen en todo proyecto**. `e2e` no tenía traducción posible | Que la constitución pueda declarar un tipo inhabilitado |
| P5 | `backlog/README.md` habla de los formularios que el paso 6 borra: **queda mintiendo apenas se usa** | Que esa sección se borre con ellos |
| P6 | `.gitkeep` en `backlog/` pero no en `docs/decisiones/`, que desaparece del repo al vaciarse | Agregarlo |
| P7 | El markdown de la plantilla **no pasa el Prettier** de un proyecto real | Formatearlo, o avisar que puede chocar |
| P8 | Sin default para el caso más común: **proyecto de una persona** (§6, «quién cierra») | Poner el default |
| P9 | Sin criterio de cuántos principios son suficientes | Decir un rango, o quitar la exigencia |
| P10 | **`MVP` no aplica a un proyecto derivado**: el producto ya existe entero, lo que falta es puesta a punto | Que el atributo sea opcional de verdad |
| P11 | No dice si un **hito stub sin significado** es válido o basura | Decir que un hito existe cuando su significado está escrito |

---

## Veredicto

**El gate está cumplido.** Un proyecto real arrancó desde la plantilla en una hora, sin acceso a la
especificación, y produjo un backlog válido con un ítem cerrado y verificado.

Pero la corrida dejó **12 hallazgos de formato y 11 de plantilla**, y varios de los de plantilla hacen
tropezar de entrada a quien la use. Cerrar la fase 0 sin aplicarlos sería declarar terminado algo que
ya sabemos que falla.

**Propuesta:** aplicar los de plantilla (baratos, todos conocidos) y los de formato que tengan
consecuencia sobre el validador —**F1, F2, F5, F6, F7**— antes de dar la fase por cerrada. El resto
puede esperar a la fase 1, donde el uso repetido va a decir cuáles son reales.
