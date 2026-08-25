# Prompt para nueva sesión — FaLuSpec

---

## ▼ COPIAR DESDE ACÁ ▼

Estoy trabajando en **FaLuSpec**, un formato propio para especificar trabajo de software de modo que
una máquina pueda verificarlo. Está en **fase 0** (definir el formato; todavía no hay herramientas).

Leé en este orden antes de proponer nada:

1. `README.md` — qué es y el plan de 3 fases con sus gates.
2. `docs/ESPECIFICACION.md` — el formato. Es el entregable central de la fase 0.
3. `docs/decisiones/001-por-que-existe.md` — contra qué se comparó y qué se tomó de cada alternativa.
4. El **Log de sesiones** al final de este archivo — empezá por la entrada de arriba.
5. `docs/pruebas/001-parametrizacion-cliente/HALLAZGOS.md` — la prueba del formato contra un caso
   real, ya hecha. Sus 7 propuestas son la agenda de la v0.2.

**Regla dura del proyecto:** la especificación define *la forma*, nunca *el contenido*. Si una regla
no se puede enunciar sin nombrar un proyecto, un cliente o un stack concreto, no va en la spec.

**Próximo paso** (movimiento 3 de la fase 0): decidir cuáles de los 7 hallazgos entran en la
especificación v0.2 y aplicarlos. La spec sigue en v0.1 intacta: la prueba no la tocó.

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

### Abiertas (ver §9 de la especificación)

Ubicación de los archivos de ítem · criterios compartidos entre ítems · versionado del formato ·
si las prioridades son parte del formato o de cada proyecto.

### Tomado de otras herramientas

Se evaluaron OpenSpec v1.10.0 y github/spec-kit ejecutando sus CLI. **Se toma:** separación entre
vigente e histórico, validación como comando que falla en CI, constitución de principios, directorio
como unidad de trabajo. **No se toma:** renunciar a la capa de producto, delegar el plan a GitHub,
ciclos de diez comandos.

---

## Log de sesiones

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

**Pendiente.** El caso está escrito y sin commitear.

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
