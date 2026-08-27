# FaLuSpec — especificación del formato

> Versión 0.5 · borrador · 2026-08-26
>
> Este documento define **la forma**, con independencia de cualquier proyecto. Ninguna regla de acá
> puede mencionar un dominio, un cliente ni un stack concreto. Si una regla no se puede enunciar sin
> nombrar un proyecto, es contenido y no pertenece a este documento.

## 1. Qué define este documento

FaLuSpec es un formato para especificar trabajo de software de modo que **una máquina pueda
verificarlo**: qué se va a construir, cómo se sabe que está bien, dónde vive en el código y con qué
se comprueba.

Define cuatro constructos, del más chico al más grande:

| Constructo | Es | Se compone de |
|---|---|---|
| **Criterio** | el átomo — la unidad mínima verificable | — |
| **Ítem** | una unidad de trabajo asignable | criterios |
| **Épica** | un agrupador temático | ítems |
| **Hito** | un corte de release con significado | épicas e ítems |

No define: herramientas, flujo de git, convenciones de commit, ni proceso de equipo. Eso vive en la
**constitución** de cada proyecto, que es un documento aparte.

---

## 2. El criterio — el átomo

Un criterio es la afirmación más chica que se puede verificar de forma independiente. **Si se parte,
deja de significar algo**: media condición no es un criterio.

Todo lo demás en FaLuSpec existe para agrupar criterios o para generar vistas sobre ellos.

### 2.1 Anatomía

Un criterio tiene cuatro partes, y las cuatro son lo que lo distingue de una historia de usuario común:

```markdown
### E4-07.2 — Reintento con espera creciente

**Dado** un envío que falló por error de red, **cuando** el reintento se programa,
**entonces** la espera es el doble de la anterior, con un techo de 30 minutos.

- ancla: `src/notificaciones/reintento.ts#calcularEspera`
- verifica: `unit` → `reintento.test.ts::espera creciente con techo`
```

| Parte | Rol |
|---|---|
| **Identificador** | Lo hace direccionable. Un agente, un test o un reporte pueden nombrarlo con un solo string. |
| **Escenario** | Dado / cuando / entonces. Describe la condición observable, no la implementación. |
| **Ancla** | Dónde vive en el código. Permite comprobar que el criterio sigue teniendo sustento. |
| **Verificación** | Con qué se comprueba. Permite medir cobertura por criterio, no por archivo. |

### 2.2 Reglas de validez

Un criterio es **válido** cuando:

1. Su identificador respeta la gramática de §6 y es único en todo el proyecto.
2. Su escenario nombra una condición observable desde afuera del código.
3. Si el ítem que lo contiene está en estado `done`, **declara** al menos un `ancla` y una `verifica`.
4. Cada `ancla` resuelve a algo que existe, o es `ninguna` con su motivo (§2.3).
5. Su `verifica` declara un tipo de los definidos en §2.4.
6. Su `verifica` **puede fallar si el criterio se incumple**.

Un criterio de un ítem que **no** está `done` puede no tener ancla ni verificación: todavía no está
implementado, y exigirle ancla obligaría a inventarla.

La regla 6 es la que impide el fraude más silencioso del formato: una verificación que existe, corre
y pasa, pero que no distingue el caso que el criterio prohíbe. Un criterio que exige «cada depósito
con su ciudad, sin nombres genéricos» verificado por un test que cuenta filas está **formalmente
válido y materialmente vacío** — cierra en verde con el problema intacto. No se valida
automáticamente; se audita preguntando una sola cosa: *¿qué tendría que pasar para que este test se
ponga rojo, y es lo mismo que este criterio prohíbe?*

**Declarar no es tener.** Hay criterios que no van a tener ancla nunca, y no por falta de trabajo:
el estado que afirman vive fuera del repositorio, o su alcance es el repositorio entero. Para ésos,
`ancla: ninguna — <motivo>` es una declaración válida y suficiente. Lo que la regla 3 prohíbe es el
silencio, no la ausencia.

### 2.3 El ancla

El ancla dice **dónde vive la implementación** de ese criterio. Su forma normal es:

```
ruta/al/archivo.ext#simboloCalificado
```

**El ancla apunta a un símbolo, nunca a un número de línea.** Un símbolo se puede resolver
mecánicamente: si se renombró o se borró, la validación falla y avisa. Un número de línea se pudre en
silencio — basta que alguien agregue una línea más arriba para que apunte a otra cosa, sin que nada
lo note.

El símbolo **no necesita estar exportado**. Lo que hay que parametrizar o corregir suele ser una
constante privada del módulo, y exigir que sea pública para poder anclarla sería dejar que el formato
decida el diseño del código.

Se admite **un nivel de profundidad** dentro del símbolo (`#esquema.CLAVE`) cuando el criterio habla
de una parte y no del todo. Uno solo: si para localizar el criterio hace falta bajar más, el ancla
empieza a parecerse a un número de línea, y el problema probablemente sea el diseño del código.

#### Las otras tres formas

| Forma | Cuándo |
|---|---|
| `ruta/al/archivo.ext` | El archivo no tiene símbolos que nombrar: un binario, un archivo de configuración, un conjunto de datos. |
| `ruta/al/directorio/` | El criterio habla de un conjunto de archivos que se sostiene como conjunto — un directorio de íconos, de migraciones, de fixtures. La barra final es obligatoria. |
| `ninguna — <motivo>` | El criterio no tiene dónde anclarse, y eso es permanente. |

El ancla a archivo o a directorio vale **sólo** cuando no hay símbolo posible. Si el archivo tiene símbolos,
hay que nombrar uno: usarlo como escape convierte el ancla en una ruta y le saca lo único que la hacía
verificable.

`ninguna` **es una declaración, no un hueco.** Lleva motivo obligatorio, y existe para tres casos que
aparecen de verdad:

- lo que el criterio afirma vive **fuera del repositorio** — un registro DNS, la consola de un
  proveedor, un archivo que nunca se versiona;
- el alcance del criterio es **el repositorio entero** («no queda ninguna ocurrencia de X»), y por lo
  tanto no hay un lugar donde mirar;
- el trabajo **es el test mismo**, y entonces la verificación ya dice dónde.

Es el mismo movimiento que `manual` en §2.4: nombrar lo que no se puede hacer, en vez de dejar un
vacío que no se distingue de un olvido. Y habilita la misma medición — qué parte del proyecto **no
vive en el código** es un dato de gestión, no un accidente.

#### Cuántas

Un criterio puede tener **más de un ancla** cuando su implementación está genuinamente repartida.
Si necesita más de tres, es señal de que el criterio es demasiado grande y conviene partirlo.

Hay criterios que afirman una **ausencia** («no se registra el dato en el log»). Anclarlos al lugar
donde la ausencia debe sostenerse es correcto y suficiente: el ancla marca dónde miraría alguien que
quiera romperlo. Cuando la ausencia no tiene un lugar sino que abarca el repositorio, el ancla es
`ninguna` y la verificación es `estatica`.

### 2.4 La verificación

Declara cómo se comprueba el criterio:

| Tipo | Significa |
|---|---|
| `unit` | Test unitario, con dependencias externas simuladas. |
| `integracion` | Test contra dependencias reales (base de datos, servicios levantados). |
| `e2e` | Recorrido completo por la interfaz o la API pública. |
| `estatica` | Chequeo mecánico sobre el repositorio, no sobre el sistema corriendo. |
| `manual` | Se comprueba a mano. Valor legítimo, no un pendiente. |

`manual` existe a propósito. Hay criterios que no se automatizan de forma razonable, y forzar un tipo
automatizado sería mentir en el documento. Al ser un valor explícito, además se puede **medir**:
qué porcentaje del proyecto depende de verificación humana es un dato de gestión, no un accidente.

`estatica` es para los criterios que afirman algo del **repositorio** y no del sistema: que un valor
heredado no sobreviva en ningún archivo, que ningún secreto viaje versionado, que no quede una marca
de pendiente. No es un test —no ejecuta el producto— pero tampoco es manual: **nadie juzga nada, el
comando devuelve un resultado o no lo devuelve.**

El tipo se define por eso y **no por dónde corre**. Que además esté en CI es una recomendación de la
constitución del proyecto, no parte del tipo: un chequeo reproducible que hoy se corre a mano sigue
siendo `estatica`, y llamarlo `manual` mentiría sobre quién decide el resultado.

Cuando el tipo no es `manual`, la verificación **debería** nombrar el test concreto. Eso habilita el
reporte de cobertura por criterio: qué criterios tienen test y cuáles se quedaron sin.

#### La verificación se escribe antes de implementar

Nombrar el test antes de que exista no es adelantarse: es la parte que convierte al criterio en una
**orden de trabajo**. Un criterio con `verifica` completa le dice a quien lo implemente —persona o
agente— qué archivo tocar y cómo se va a llamar la prueba que lo cierra. El nombre del test es parte
de la especificación; lo que queda después es sólo escribirlo.

---

## 3. El ítem

Un ítem es la unidad de trabajo que se asigna, se implementa y se cierra. Es lo que un agente recibe
como orden de trabajo y lo que aparece como fila en el backlog.

### 3.1 Forma

Un ítem es **un archivo**. Su encabezado es legible por máquina; su cuerpo, por personas.

```markdown
---
id: E4-07
epica: E4
titulo: Reintento de notificaciones fallidas
prioridad: P1
estado: wip
fecha_estado: 2026-08-20
depende_de: [E4-03]
---

## Historia

Como responsable de la operación, quiero que un envío fallido se reintente solo,
para no tener que revisar a mano qué no salió.

## Criterios

### E4-07.1 — ...
### E4-07.2 — ...
```

### 3.2 Campos del encabezado

| Campo | Obligatorio | Regla |
|---|---|---|
| `id` | sí | Gramática de §6, único en el proyecto. |
| `epica` | sí | Debe existir. Debe coincidir con el prefijo del `id`. |
| `titulo` | sí | Una línea, en imperativo o sustantivo. |
| `prioridad` | sí | Uno de los niveles definidos por el proyecto en su constitución. |
| `estado` | sí | Uno de §7. |
| `fecha_estado` | condicional | Obligatorio cuando el estado es `done` o `blocked`. |
| `bloqueado_por` | condicional | Obligatorio cuando el estado es `blocked`. **Una línea corta**: qué se espera y de quién. El detalle va al historial — este campo termina dentro de una celda de tabla. |
| `depende_de` | no | Lista de identificadores de ítems que deben estar `done` antes de empezar éste. |
| `hito` | no | El corte de release al que pertenece. Debe existir. Un ítem sin `hito` es legítimo: todavía no entró en ningún corte. |

El proyecto puede agregar campos propios — sprint, responsable, estimación. La validación los ignora,
pero las vistas pueden usarlos.

### 3.3 Reglas de validez

1. Todo `depende_de` apunta a un ítem que existe.
2. El grafo de dependencias no tiene ciclos.
3. Un ítem `done` tiene `fecha_estado`.
4. Un ítem `done` tiene al menos un criterio, y todos sus criterios son válidos según §2.2.
5. Un ítem no puede estar `done` si alguno de sus `depende_de` no lo está.
6. Un ítem `blocked` tiene `bloqueado_por`, propio o heredado de su épica (§4).
7. Un ítem `done` declara su impacto (§3.5), aunque sea «ninguno».
8. Si declara `hito`, ese hito existe.

**Un bloqueo tiene que ser consultable.** El detalle de la causa va al historial, pero si el
encabezado no dice qué se espera, la pregunta más frecuente de cualquier revisión de estado —qué
está trabado y por quién— obliga a leer prosa ítem por ítem, y ninguna vista la puede responder.
`bloqueado_por` es una línea de texto libre, no un sistema de tickets.

**Las dependencias pueden cruzar épicas.** Las épicas agrupan por tema, no aíslan: prohibir el cruce
obligaría a inventar épicas artificiales para acomodar el grafo.

### 3.4 El historial es aparte

Las notas de lo que pasó —qué se decidió, qué se descartó, qué quedó pendiente— **no van en el
encabezado ni en los criterios**. Van al historial del ítem.

El ítem vigente responde *qué tiene que ser cierto*. El historial responde *cómo llegamos*. Mezclarlos
convierte el backlog en un changelog, y obliga a leer historia para saber el estado actual.

**El historial arranca cuando hay algo que registrar, no cuando empieza la implementación.** Cubre
dos cosas que se confunden fácil:

- **Decisiones sobre el ítem**: por qué está bloqueado, qué alternativa se descartó al escribirlo, por
  qué un criterio dice hoy algo distinto de lo que decía ayer. Existen desde el día que el ítem se
  escribe, y si no se registran, la próxima persona reabre la misma discusión.
- **Decisiones de implementación**: lo que se resolvió mientras se hacía.

Sin la primera, el diff de un ítem no distingue una **corrección de la especificación** de un **cambio
de alcance**, que es una diferencia que importa mucho.

### 3.5 El impacto declarado

Un ítem `done` declara **qué movió fuera de sus propios criterios**: otro ítem ya cerrado, una regla
de la constitución, el comportamiento de un ambiente. Si no movió nada, lo dice.

```markdown
## Impacto

Ninguno.
```

Parece burocracia y no lo es. El formato verifica que se cumpla **lo declarado**; no tiene forma de
detectar lo que se movió **sin declarar**. Un ítem puede tener todos sus criterios en verde, estar
auditado, y haber cambiado una regla del proyecto que nadie va a ver — porque ningún criterio hablaba
de eso, y por lo tanto ninguna verificación lo iba a tocar.

Lo que no se pregunta no se responde. Por eso la sección es obligatoria en `done` y su valor más
frecuente es «ninguno»: el trabajo lo hace la pregunta, no la respuesta.

### 3.6 El encabezado no es YAML

Se le parece, y conviene decirlo antes de que alguien lo dé por sentado.

El encabezado va entre líneas de `---` y es un subconjunto declarado:

- **`clave: valor`, una línea por campo.** Las claves, en minúscula, con guión bajo.
- **El valor es todo el texto hasta el fin de la línea, y es texto.** Sin tipos, sin comillas, sin
  booleanos, sin números. Un valor puede contener `:` sin escaparlo.
- **Las listas van entre corchetes, en una línea**, separadas por coma: `[E4-03, E4-07]`.
- **Nada más.** Sin anidamiento, sin valores multilínea, sin comentarios, sin referencias.

Adoptar YAML entero traería dos cosas que no queremos. Su **tipado implícito**: un `titulo: no` se
convertiría en el booleano falso, y una versión `0.10` en el número `0.1`. Y una **dependencia de
parser** en cada lenguaje donde alguien quiera leer un backlog. El encabezado así definido se lee con
cinco líneas de código en cualquier lenguaje, y eso es un rasgo del formato, no un detalle de
implementación.

Un editor que resalte YAML va a resaltar bien estos encabezados. Que se vea igual no lo vuelve lo
mismo.

---

## 4. La épica

Agrupador temático de ítems. Tiene identificador, título, y criterios de aceptación propios que
afirman algo sobre el conjunto, no sobre un ítem suelto.

Una épica **no** tiene estado propio: su avance se deriva del estado de sus ítems. Guardar un estado
de épica invita a que contradiga a sus partes.

Sí puede declarar un **`bloqueado_por` propio**, cuando todos o casi todos sus ítems esperan lo mismo,
de la misma persona. No es estado —no se deriva de nada ni contradice a nadie—: es la causa común,
dicha una vez. Sin esto, el dato más importante de una épica parada —que está parada, y por quién—
sólo se ve abriendo sus ítems de a uno. Cada ítem conserva el suyo si tiene una espera propia.

---

## 5. El hito

Un corte de release. Su rasgo distintivo en FaLuSpec: **se define por lo que significa para una
persona, no por una lista de entregables.**

```markdown
## H3 — La planilla queda obsoleta

Significado: quien hoy carga los pedidos a mano deja de abrir la planilla.
Estado: abierto
```

La lista de entregables es consecuencia, no definición. Un hito que sólo enumera épicas no permite
decidir si un ítem dudoso entra o queda afuera; uno que declara un significado, sí.

Un hito puede declararse **MVP**. Es un atributo del hito, no un constructo aparte.

### 5.1 Un hito no lleva su lista de contenido

**La relación entre ítem e hito vive en el ítem**, en su campo `hito`. El hito declara únicamente lo
que lo hace un hito: su significado y su estado.

Antes esa relación se escribía en el hito, en prosa: «E2, E4 completas · E6 sin el heatmap». Se lee
bien y **no se computa** —«E6 sin el heatmap» no dice qué ítems son— así que ninguna vista podía
responder qué entra en cada corte, y la lista se desactualizaba sola cada vez que aparecía un ítem
nuevo.

El costo es real: abrir el archivo de un hito ya no dice qué contiene. Lo responde el story map
(`VISTAS.md` §6), que se genera y por lo tanto no puede mentir. Se cambió una lista legible que se
pudre por una vista exacta que hay que ir a buscar, y para eso existen las vistas.

**El significado sigue siendo prosa, y debe serlo.** Es lo único del hito que una máquina no puede
derivar, y lo único que sirve para decidir si un ítem dudoso entra.

---

## 6. Gramática de identificadores

```
épica     E<n>              E4
ítem      E<n>-<nn>         E4-07
criterio  E<n>-<nn>.<n>     E4-07.2
hito      H<n>              H3
```

- `<n>` es un entero sin ceros a la izquierda; `<nn>` lleva dos dígitos.
- Los identificadores **no se reciclan**. Un ítem descartado deja su número quemado.
- Los identificadores **no se renumeran** para tapar huecos. El hueco es información: algo existió ahí.

Los identificadores son la superficie de contacto entre documentos, tests, agentes y commits. Su
estabilidad es lo que permite que un test se llame como un criterio y que eso siga siendo cierto un
año después.

---

## 7. Estados

| Estado | Significa |
|---|---|
| `todo` | Especificado, no empezado. |
| `wip` | En ejecución. |
| `done` | Cumple todos sus criterios y el DoD del proyecto. |
| `blocked` | No puede avanzar por una causa externa. Qué se espera va en `bloqueado_por`; el detalle, en el historial. |

Transiciones legales:

```
todo ──→ wip ──→ done
  ↑       ↓
  └── blocked ──┘
```

Un ítem puede volver de `blocked` a `todo` o a `wip`. **No puede volver de `done`**: si algo que
estaba cerrado se rompió, eso es un ítem nuevo, con su propio identificador. Reabrir borra la
evidencia de que alguna vez estuvo bien.

**Un ítem puede nacer en cualquier estado menos `done`.** El diagrama dice qué transiciones son
legales, no por dónde hay que entrar. Un ítem que el día que se escribe ya está esperando a un tercero
nace `blocked`: ponerlo en `todo` afirmaría que alguien podría empezarlo, que es falso.

**`fecha_estado` es desde cuándo está así**, no cuándo alguien lo pasó a ese estado. Para un ítem
nacido bloqueado son la misma fecha; para el resto, la primera es la que sirve para saber hace cuánto
que algo no se mueve.

---

## 8. Fuente y vistas

Los **ítems son la fuente**. Todo lo demás se genera:

| Vista | Se deriva de |
|---|---|
| Tabla de backlog | encabezados de todos los ítems |
| Resumen por épica | conteo de estados de sus ítems |
| Bloqueos | los `bloqueado_por` de ítems y épicas, agrupados por causa |
| Cobertura por criterio | campos `verifica` cruzados con los tests que existen |
| Story map | el campo `hito` de cada ítem, cruzado con las épicas |
| Contenido de un hito | los ítems que lo declaran |

La **forma exacta** de cada una —columnas, orden, qué campo alimenta qué celda— está en
[`VISTAS.md`](VISTAS.md), junto con las reglas que valen para todas: determinismo, orden declarado, y
que una vista pueda omitir pero nunca inventar.

Escribir una vista a mano y tratarla como fuente es el error que este formato existe para evitar:
las vistas no se pueden validar ni regenerar, y dos personas editándolas chocan en cada merge.

---

## 9. Decisiones abiertas

Cuestiones sobre las que el formato todavía no se comprometió. Se resuelven con uso, no discutiendo.
**Las cerradas se tachan y se quedan acá**, con su número: igual que los identificadores de ítem, no
se reciclan ni se renumeran, porque su número aparece citado en las pruebas que las cerraron.

1. **Ubicación de los archivos de ítem.** ¿Un directorio plano, o uno por épica? Plano es más simple
   de recorrer; por épica escala mejor a cientos de ítems. *La prueba 001 no dio evidencia: con ocho
   ítems de una sola épica, plano es cómodo y no prueba nada. Hace falta un caso con varias épicas
   vivas a la vez.*
2. **Criterios compartidos entre ítems.** Hoy no existen. Si aparece la necesidad real, habrá que
   decidir entre duplicar o referenciar. *La prueba 001 no la hizo aparecer: sus criterios se repiten
   en espíritu, pero cada uno tiene su propia ancla.*
3. ~~**Versionado del formato.**~~ **Cerrada en la v0.5** → §10, el archivo `.faluspec`. Hicieron
   falta tres pruebas para que dejara de ser hipotética; en la última, una vista se generó desde un
   backlog viejo, salió inútil, y nada avisó.
4. **Prioridades.** Hoy las define cada proyecto en su constitución. Podrían ser parte del formato,
   a costa de imponer un esquema.
5. **Dónde viven la épica y el historial.** §3.1 dice que un ítem es un archivo, pero §4 no dice si
   la épica lo es, y §3.4 manda el historial «aparte» sin decir aparte dónde: ¿otra sección del mismo
   archivo, otro archivo, otro directorio? Son dos huecos del formato, no decisiones de cada proyecto.
   La plantilla elige un default para poder arrancar —épica como archivo junto a sus ítems, historial
   como última sección del ítem— y lo declara como elección suya.
6. **Régimen de los criterios de épica.** Las reglas de §2.2 están escritas suponiendo que el
   contenedor del criterio es un ítem, y una épica no tiene estado propio (§4) — así que sus criterios
   nunca disparan la exigencia de ancla y verificación. ¿Se les aplica el mismo régimen que a los de
   ítem, uno más laxo, o directamente ninguno?
7. ~~**Qué subconjunto de YAML es el encabezado.**~~ **Cerrada en la v0.5** → §3.6: no es YAML, es un
   subconjunto declarado. Se cerró antes de escribir el CLI, que era exactamente el motivo por el que
   estaba anotada.

---

## 10. La versión declarada

Un proyecto declara contra qué versión de FaLuSpec está escrito, en un archivo **`.faluspec`** en su
raíz, con una sola línea:

```
0.5
```

**Por qué un archivo y no la constitución.** La constitución es prosa para personas; esto lo lee una
herramienta, y hacerle parsear prosa para saber qué reglas aplicar es pedirle que adivine. La
constitución puede seguir mencionándola para quien lea, pero la fuente es el archivo.

**Por qué no en cada ítem.** Se duplicaría una vez por ítem y se desincronizaría al primer descuido.
La versión es del proyecto, no del ítem.

**Si el archivo falta, la herramienta falla y dice cómo crearlo.** No supone la última versión ni la
primera: las dos son adivinar, y adivinar mal produce un resultado que parece correcto. Esta regla
salió de una vista que se generó «bien» desde un backlog viejo y era inútil, sin que nada avisara.

---

## 11. Historial de versiones

| Versión | Fecha | Qué cambió |
|---|---|---|
| 0.1 | 2026-08-25 | Primera definición: los cuatro constructos, la gramática de identificadores, los estados y sus transiciones. |
| 0.2 | 2026-08-25 | Tipo de verificación `estatica` · ancla a archivo entero y ancla `ninguna` declarada · símbolos no exportados y un nivel de propiedad · `bloqueado_por` · la verificación como encargo. |
| 0.3 | 2026-08-26 | Impacto declarado en `done` · la verificación tiene que poder fallar · `estatica` definida por lo que es y no por dónde corre · `bloqueado_por` de épica · se puede nacer en cualquier estado salvo `done` · el historial cubre decisiones, no sólo implementación · ancla a directorio. |
| 0.4 | 2026-08-26 | Campo `hito` en el ítem: la relación con el corte de release vive en el ítem, y el hito deja de llevar su lista de contenido. |
| 0.5 | 2026-08-26 | El encabezado deja de ser «YAML» y pasa a ser un subconjunto declarado (§3.6) · un proyecto declara su versión en `.faluspec` (§10). Las dos cierran decisiones abiertas, y las dos se cerraron antes del CLI porque condicionan el parser. |

Ninguna salió de discutir el formato. La 0.2 salió de **escribir un caso real con él**; la 0.3, de
**usarlo para trabajar** —arrancar un proyecto, cerrar un ítem y auditarlo—; la 0.4, de **definir las
vistas** y encontrar que una de ellas era imposible de generar ([`VISTAS.md`](VISTAS.md) §7):

- [`pruebas/001-parametrizacion-cliente/HALLAZGOS.md`](pruebas/001-parametrizacion-cliente/HALLAZGOS.md)
- [`pruebas/002-arranque-desde-plantilla/HALLAZGOS.md`](pruebas/002-arranque-desde-plantilla/HALLAZGOS.md)

Los hallazgos de la 002 que **no** entraron en la 0.3 —F3, F4, F9, F10, F12— están anotados ahí. Se
resuelven con uso repetido, no discutiéndolos ahora.
