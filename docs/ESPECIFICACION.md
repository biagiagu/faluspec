# FaLuSpec — especificación del formato

> Versión 0.2 · borrador · 2026-08-25
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

Un criterio de un ítem que **no** está `done` puede no tener ancla ni verificación: todavía no está
implementado, y exigirle ancla obligaría a inventarla.

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

#### Las otras dos formas

| Forma | Cuándo |
|---|---|
| `ruta/al/archivo.ext` | El archivo no tiene símbolos que nombrar: un binario, un archivo de configuración, un conjunto de datos. |
| `ninguna — <motivo>` | El criterio no tiene dónde anclarse, y eso es permanente. |

El ancla a archivo entero vale **sólo** cuando no hay símbolo posible. Si el archivo tiene símbolos,
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
| `estatica` | Chequeo sobre el repositorio y no sobre el sistema corriendo. Corre en CI y rompe el build. |
| `manual` | Se comprueba a mano. Valor legítimo, no un pendiente. |

`manual` existe a propósito. Hay criterios que no se automatizan de forma razonable, y forzar un tipo
automatizado sería mentir en el documento. Al ser un valor explícito, además se puede **medir**:
qué porcentaje del proyecto depende de verificación humana es un dato de gestión, no un accidente.

`estatica` es para los criterios que afirman algo del **repositorio** y no del sistema: que un valor
heredado no sobreviva en ningún archivo, que ningún secreto viaje versionado, que no quede una marca
de pendiente. No es un test —no ejecuta el producto— pero tampoco es manual: corre solo y falla el
build. Sin este tipo, esos criterios sólo se pueden escribir mintiendo sobre cómo se comprueban.

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
| `bloqueado_por` | condicional | Obligatorio cuando el estado es `blocked`. Una línea: qué se está esperando, y de quién. |
| `depende_de` | no | Lista de identificadores de ítems que deben estar `done` antes de empezar éste. |

El proyecto puede agregar campos propios — sprint, responsable, estimación. La validación los ignora,
pero las vistas pueden usarlos.

### 3.3 Reglas de validez

1. Todo `depende_de` apunta a un ítem que existe.
2. El grafo de dependencias no tiene ciclos.
3. Un ítem `done` tiene `fecha_estado`.
4. Un ítem `done` tiene al menos un criterio, y todos sus criterios son válidos según §2.2.
5. Un ítem no puede estar `done` si alguno de sus `depende_de` no lo está.
6. Un ítem `blocked` tiene `bloqueado_por`.

**Un bloqueo tiene que ser consultable.** El detalle de la causa va al historial, pero si el
encabezado no dice qué se espera, la pregunta más frecuente de cualquier revisión de estado —qué
está trabado y por quién— obliga a leer prosa ítem por ítem, y ninguna vista la puede responder.
`bloqueado_por` es una línea de texto libre, no un sistema de tickets.

**Las dependencias pueden cruzar épicas.** Las épicas agrupan por tema, no aíslan: prohibir el cruce
obligaría a inventar épicas artificiales para acomodar el grafo.

### 3.4 El historial es aparte

Las notas de lo que pasó durante la implementación —qué se decidió, qué se descartó, qué quedó
pendiente— **no van en el encabezado ni en los criterios**. Van al historial del ítem.

El ítem vigente responde *qué tiene que ser cierto*. El historial responde *cómo llegamos*. Mezclarlos
convierte el backlog en un changelog, y obliga a leer historia para saber el estado actual.

---

## 4. La épica

Agrupador temático de ítems. Tiene identificador, título, y criterios de aceptación propios que
afirman algo sobre el conjunto, no sobre un ítem suelto.

Una épica **no** tiene estado propio: su avance se deriva del estado de sus ítems. Guardar un estado
de épica invita a que contradiga a sus partes.

---

## 5. El hito

Un corte de release. Su rasgo distintivo en FaLuSpec: **se define por lo que significa para una
persona, no por una lista de entregables.**

```markdown
## H3 — La planilla queda obsoleta

Significado: quien hoy carga los pedidos a mano deja de abrir la planilla.
Contiene: E2, E4, E10 completas · E6 sin el heatmap.
Estado: abierto
```

La lista de entregables es consecuencia, no definición. Un hito que sólo enumera épicas no permite
decidir si un ítem dudoso entra o queda afuera; uno que declara un significado, sí.

Un hito puede declararse **MVP**. Es un atributo del hito, no un constructo aparte.

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

---

## 8. Fuente y vistas

Los **ítems son la fuente**. Todo lo demás se genera:

| Vista | Se deriva de |
|---|---|
| Tabla de backlog | encabezados de todos los ítems |
| Resumen por épica | conteo de estados de sus ítems |
| Story map | épicas × hitos, con los ítems como celdas |
| Cobertura por criterio | campos `verifica` cruzados con los tests que existen |

Escribir una vista a mano y tratarla como fuente es el error que este formato existe para evitar:
las vistas no se pueden validar ni regenerar, y dos personas editándolas chocan en cada merge.

---

## 9. Decisiones abiertas

Cuestiones sobre las que el formato todavía no se comprometió. Se resuelven con uso, no discutiendo.

1. **Ubicación de los archivos de ítem.** ¿Un directorio plano, o uno por épica? Plano es más simple
   de recorrer; por épica escala mejor a cientos de ítems. *La prueba 001 no dio evidencia: con ocho
   ítems de una sola épica, plano es cómodo y no prueba nada. Hace falta un caso con varias épicas
   vivas a la vez.*
2. **Criterios compartidos entre ítems.** Hoy no existen. Si aparece la necesidad real, habrá que
   decidir entre duplicar o referenciar. *La prueba 001 no la hizo aparecer: sus criterios se repiten
   en espíritu, pero cada uno tiene su propia ancla.*
3. **Versionado del formato.** Un proyecto debería declarar contra qué versión de FaLuSpec está
   escrito, para que la validación sepa qué reglas aplicar. *Con la 0.2 ya hay dos versiones y la
   segunda agrega valores que la primera rechazaría. La decisión dejó de ser hipotética.*
4. **Prioridades.** Hoy las define cada proyecto en su constitución. Podrían ser parte del formato,
   a costa de imponer un esquema.
5. **Régimen de los criterios de épica.** Las reglas de §2.2 están escritas suponiendo que el
   contenedor del criterio es un ítem, y una épica no tiene estado propio (§4) — así que sus criterios
   nunca disparan la exigencia de ancla y verificación. ¿Se les aplica el mismo régimen que a los de
   ítem, uno más laxo, o directamente ninguno?

---

## 10. Historial de versiones

| Versión | Fecha | Qué cambió |
|---|---|---|
| 0.1 | 2026-08-25 | Primera definición: los cuatro constructos, la gramática de identificadores, los estados y sus transiciones. |
| 0.2 | 2026-08-25 | Tipo de verificación `estatica` · ancla a archivo entero y ancla `ninguna` declarada · símbolos no exportados y un nivel de propiedad · `bloqueado_por` · la verificación como encargo. |

Los cambios de la 0.2 no salieron de discutir el formato sino de **escribir un caso real con él** y
anotar dónde crujía:
[`docs/pruebas/001-parametrizacion-cliente/HALLAZGOS.md`](pruebas/001-parametrizacion-cliente/HALLAZGOS.md).
