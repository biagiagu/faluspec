# FaLuSpec — especificación del formato

> Versión 0.1 · borrador · 2026-08-25
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
3. Si el ítem que lo contiene está en estado `done`, tiene al menos un `ancla` y una `verifica`.
4. Cada `ancla` resuelve a un símbolo existente.
5. Su `verifica` declara un tipo de los definidos en §2.4.

Un criterio de un ítem que **no** está `done` puede no tener ancla ni verificación: todavía no está
implementado, y exigirle ancla obligaría a inventarla.

### 2.3 El ancla

El ancla dice **dónde vive la implementación** de ese criterio. Su forma es:

```
ruta/al/archivo.ext#simboloCalificado
```

**El ancla apunta a un símbolo, nunca a un número de línea.** Un símbolo se puede resolver
mecánicamente: si se renombró o se borró, la validación falla y avisa. Un número de línea se pudre en
silencio — basta que alguien agregue una línea más arriba para que apunte a otra cosa, sin que nada
lo note.

Un criterio puede tener **más de un ancla** cuando su implementación está genuinamente repartida.
Si necesita más de tres, es señal de que el criterio es demasiado grande y conviene partirlo.

Hay criterios que afirman una **ausencia** («no se registra el dato en el log»). Anclarlos al lugar
donde la ausencia debe sostenerse es correcto y suficiente: el ancla marca dónde miraría alguien que
quiera romperlo.

### 2.4 La verificación

Declara cómo se comprueba el criterio:

| Tipo | Significa |
|---|---|
| `unit` | Test unitario, con dependencias externas simuladas. |
| `integracion` | Test contra dependencias reales (base de datos, servicios levantados). |
| `e2e` | Recorrido completo por la interfaz o la API pública. |
| `manual` | Se comprueba a mano. Valor legítimo, no un pendiente. |

`manual` existe a propósito. Hay criterios que no se automatizan de forma razonable, y forzar un tipo
automatizado sería mentir en el documento. Al ser un valor explícito, además se puede **medir**:
qué porcentaje del proyecto depende de verificación humana es un dato de gestión, no un accidente.

Cuando el tipo no es `manual`, la verificación **debería** nombrar el test concreto. Eso habilita el
reporte de cobertura por criterio: qué criterios tienen test y cuáles se quedaron sin.

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
| `depende_de` | no | Lista de identificadores de ítems que deben estar `done` antes de empezar éste. |

El proyecto puede agregar campos propios — sprint, responsable, estimación. La validación los ignora,
pero las vistas pueden usarlos.

### 3.3 Reglas de validez

1. Todo `depende_de` apunta a un ítem que existe.
2. El grafo de dependencias no tiene ciclos.
3. Un ítem `done` tiene `fecha_estado`.
4. Un ítem `done` tiene al menos un criterio, y todos sus criterios son válidos según §2.2.
5. Un ítem no puede estar `done` si alguno de sus `depende_de` no lo está.

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
| `blocked` | No puede avanzar por una causa externa, que se registra en el historial. |

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
   de recorrer; por épica escala mejor a cientos de ítems.
2. **Criterios compartidos entre ítems.** Hoy no existen. Si aparece la necesidad real, habrá que
   decidir entre duplicar o referenciar.
3. **Versionado del formato.** Un proyecto debería declarar contra qué versión de FaLuSpec está
   escrito, para que la validación sepa qué reglas aplicar.
4. **Prioridades.** Hoy las define cada proyecto en su constitución. Podrían ser parte del formato,
   a costa de imponer un esquema.
