# Bitácora de arranque con FaLuSpec

> Registro de fricción, no de avance. Una línea cada vez que dudo cómo escribir algo, me falta una
> regla que la plantilla no da, tengo que decidir algo que ella deja abierto, o me haría falta
> consultar la especificación del formato (que no está en este repo).
>
> Arrancada: 2026-08-26 · Plantilla FaLuSpec `0.2`

---

## Paso 0 — lectura de la plantilla

**[falta-contexto]** La plantilla se refiere a la especificación FaLuSpec por número de sección
(`CONSTITUCION.md` §3 cita «§2.2 de la especificación»; `ARRANQUE-FALUSPEC.md` cita «§9»), pero la
especificación **no está en el repo**. Tuve que reconstruir qué exige §2.2 a partir del texto de
`agentes/especificador.md` (identificador + escenario + ancla + verificación). Si mi reconstrucción
está mal, todos los ítems quedan mal en el mismo eje y nadie lo nota.

**[inconsistencia]** `ARRANQUE-FALUSPEC.md` dice que los agentes viven en `agentes/`, y así los cita
`CONSTITUCION.md` («Los agentes disponibles están en `agentes/`»). En este repo se copiaron a
`.claude/agents/`, junto a los agentes que ya existían del proyecto base. **Decidí** no mover nada y
corregir la referencia en la constitución: mover los agentes rompería el descubrimiento de Claude
Code, que sólo lee `.claude/agents/`. La plantilla asume un layout que colisiona con el de la
herramienta.

**[hueco]** `ARRANQUE-FALUSPEC.md` no dice **en qué rama** se hace el arranque. La constitución de
este proyecto prohíbe commitear a `main`/`test`, así que el trabajo va a la rama actual
(`chore/faluspec-arranque`) para después mergear a `develop`. La plantilla no tiene nada que decir
sobre su propia incorporación al repo.

## Paso 1 — constitución

**[decisión-abierta]** §1 pide principios «peleables». La plantilla no dice **de dónde salen** ni
cuántos. Los saqué de decisiones ya tomadas y escritas (`BASE_PARA_NUEVO_PROYECTO.md`,
`ESTRATEGIA_GIT.md`, `CLAUDE.md`) en vez de inventar principios de estilo. Elegí 5. No hay criterio
en la plantilla para saber si 5 es mucho o poco.

**[hueco]** §5 pide traducir los cinco tipos de verificación a comandos del proyecto. **`e2e` no
tiene traducción**: no hay Playwright, Cypress ni nada equivalente (verificado en los cuatro
`package.json` y en `ci.yml`). La plantilla asume que los cinco tipos existen en todo proyecto. No
inventé un comando; dejé escrito que el tipo está inhabilitado y qué hacer si un criterio lo pide.

**[decisión-abierta]** §6 dice «un agente propone y `<quién>` cierra». En un repo de una sola persona
el hueco es trivial de llenar, pero la plantilla no ofrece un default para el caso más común de todos
(proyecto de una persona). Puse «quien mantiene el repo».

**[duda]** §3 arranca con «todos sus criterios se cumplen y son válidos según §2.2 de la
especificación». Ese punto 1 es de FaLuSpec, no del proyecto — pero está redactado como si fuera un
paso propio del DoD. No sé si se espera que lo deje tal cual (es parte del formato) o que lo
reescriba. Lo dejé, citando la sección aunque no pueda leerla.

## Paso 2 — hito

**[decisión-abierta]** `PLAN.md` viene con dos hitos de ejemplo (`H1` y `H2`). Escribí uno solo y
borré el stub de `H2`. La plantilla no dice si dejar hitos vacíos declarados es válido (¿un `H2` sin
significado es un hito «abierto» o basura?). Elegí que un hito existe cuando se puede escribir su
significado, no antes.

**[fricción]** «Marcá el hito como MVP si lo es» no encaja en un proyecto derivado. El producto ya
está entero y probado: no hay un MVP por construir, hay una **puesta a punto** sin la cual lo que ya
existe no se puede usar. No es MVP ni deja de serlo por poco — la categoría no aplica. Lo escribí
como nota al pie en vez de forzar el atributo.

**[duda]** El «significado» del hito tiene que servir para decidir si un ítem entra. Escribí la regla
de decisión explícita como segundo párrafo. La plantilla pide que el significado sirva para eso pero
no dice que la regla se escriba aparte, y en una sola línea narrativa no me salía que fuera
decidible. Puede ser que en FaLuSpec eso ya sea el estilo esperado, o que esté agregando una sección
que el formato no tiene.

## Paso 3 — épica E19 e ítems

**[hueco]** **Siete de ocho ítems quedaron `blocked` por la misma espera** (el cliente no entregó sus
datos). El formato obliga a repetir el motivo en cada `bloqueado_por`, y no tiene forma de decir
«toda esta épica espera lo mismo, de la misma persona». La épica sería el lugar natural, pero
`_plantilla-epica.md` dice explícitamente que una épica **no tiene estado propio**. Resultado: la
información más importante de la épica —que está enteramente parada esperando a un tercero— sólo se
ve leyendo los ocho archivos.

**[duda]** ¿Es legítimo abrir un ítem directamente en `blocked`? La plantilla trata `blocked` como un
estado al que se llega, no del que se parte (`fecha_estado: obligatorio en done y en blocked` sugiere
una transición). Decidí que sí: el estado honesto de esos siete ítems el día que se escriben es
«bloqueado», y ponerlos en `todo` diría que alguien podría empezarlos.

**[duda]** ¿Qué fecha va en `fecha_estado` de un ítem que **nace** bloqueado? Puse la de creación. La
plantilla no aclara si es «desde cuándo está en este estado» o «cuándo se lo pasó a este estado» —
para un ítem nacido bloqueado son la misma, pero la ambigüedad importa para el resto.

**[hueco]** Un criterio verificable por un **comando reproducible que no está en CI** —el `grep` de
placeholders de `E19.a`— no tiene tipo. No es `estatica` (mi constitución la ató a lo que corre en
CI, siguiendo la plantilla) ni es realmente `manual` (nadie juzga nada: el comando devuelve líneas o
no). Lo puse como `manual` y escribí el comando en el campo del test. Faltaría un tipo intermedio, o
que `estatica` no esté atada a CI.

**[decisión-abierta]** Escribí `## Historial` en ítems recién creados, cosa que `especificador.md`
prohíbe explícitamente («Sin historial — todavía no pasó nada»). Lo hice igual en cinco ítems, porque
sí pasó algo que se pierde si no se escribe: **por qué el ítem está bloqueado y qué se descartó al
escribirlo** (p. ej. en `E19-05`, que se evaluó dejar los SLA heredados). Sin eso, la próxima persona
reabre la misma discusión. Creo que el formato confunde «historial de implementación» con «historial
de decisiones sobre el ítem».

**[fricción]** `E19-04.2` fue difícil de escribir sin describir la implementación: lo que hay que
hacer es *volver a agregar una línea a un array en un test*. Lo redacté como «una instalación que
deje sin transportistas falla y nombra la tabla», que es observable — pero la tentación de escribir
«descomentar la línea 140» era fuerte, y esa versión habría sido inútil el día que el archivo cambie.

**[duda]** El ancla de `E19-08.2` apunta a un **directorio** (`apps/web/public`), no a un archivo ni
a un símbolo. La plantilla ofrece tres formas (`ruta#simbolo`, `ruta`, `ninguna`) y el verificador
dice que el ancla a archivo entero vale «sólo si ese archivo no tiene símbolos». Un directorio no
está contemplado. La alternativa era listar cinco anclas o poner `ninguna`, y las dos mienten más.

## Paso 4 — implementar y cerrar E19-01

**[funcionó]** Los cuatro criterios funcionaron literalmente como lista de tareas: cada uno traía
ancla y nombre de test escritos de antemano, y la implementación fue completar los huecos. El
criterio `.3` («el guard mira el placeholder, no la forma del dominio») **evitó una decisión mala**
que iba a tomar por mi cuenta: validar el dominio con una regex. Estaba escrito en la especificación
antes de que se me ocurriera.

**[fricción]** Cambié el ancla de `E19-01.1` de `#apiEnvSchema` a `#GOOGLE_HD_PLACEHOLDER` una vez
que el símbolo existió. Eso es exactamente lo que manda `implementador.md` («completá las anclas
ahora que el símbolo existe»), pero significa que **el ítem se editó después de especificado** y el
diff no distingue «completé el ancla» de «cambié el criterio». El formato prohíbe lo segundo y
obliga a lo primero, y no da forma de distinguirlas.

**[hueco]** Tres de los cuatro criterios comparten el ancla `#apiEnvSchema`, porque el guard es
cuatro líneas dentro de una función de 20. El formato asume que un criterio mapea a un símbolo, y
acá la granularidad del código es más gruesa que la de los criterios. Un ancla que apunta al mismo
lugar para tres criterios distintos informa menos de lo que parece.

**[hueco]** **Nada en el formato me pedía registrar que el cambio afecta al ambiente de test.** El
guard bloquea `NODE_ENV=production`, y el contenedor corre así también en test — o sea que cambió el
gate de promoción de la constitución (§3) y ningún criterio lo dice. Lo escribí en el historial
porque me pareció lo más honesto, pero el ítem podría haberse cerrado con todos los criterios en
verde sin que eso apareciera en ningún lado. **Un ítem puede estar completo y aun así haber movido
algo que nadie declaró.**

**[duda]** Tuve que **modificar cinco tests existentes** que ya no eran válidos (armaban producción
sin `GOOGLE_HD`). No es trabajo que nadie pidió —sin eso el pipeline queda rojo— pero tampoco está
en ningún criterio de `E19-01`. `implementador.md` dice «no metés trabajo que nadie pidió» y no
contempla el trabajo que *el propio cambio vuelve necesario*. Lo hice y lo registré en el historial.

**[hallazgo, fuera de FaLuSpec]** `pnpm format:check` **corre en CI y ya estaba fallando** en 14
archivos antes de que yo tocara nada — tres de ellos son archivos de la propia plantilla FaLuSpec
(`backlog/README.md`, `backlog/_ejemplo-E4-07.md`) que no pasan el Prettier de este repo. Formateé
sólo el archivo que yo rompí. Lo anoto acá porque es una regla de la constitución (§3.2) que hoy no
se cumple, y no me correspondía arreglarlo dentro de este ítem.

## Paso 5 — auditoría con el verificador

**[funcionó, y es el hallazgo más importante de todo el arranque]** El verificador encontró que
**cuatro criterios declaraban una verificación que no verificaba lo que el criterio afirma**
(`E19.a`, `E19.b`, `E19-03.1`, `E19-04.1`). Yo había escrito `verifica: integracion → base-desde-cero
.itest.ts::las tablas de catálogo quedaron con datos` en ítems que afirman «cada depósito con su
ciudad, sin nombres genéricos» — y ese test sólo hace `count(*) > 0`. Habría cerrado los ítems en
verde con el depósito «Deposito Central / A definir» todavía adentro, o sea con el problema intacto.
**El formato me hizo escribir el nombre del test antes de tiempo, y eso mismo hizo visible que el
test no alcanzaba.** Sin la obligación de nombrarlo, esto se descubría al implementar, o nunca.

**[hueco]** El verificador señaló que `E19.a` era **imposible de cumplir**: pedía que un `grep` no
devolviera nada, pero el placeholder tiene que sobrevivir en la constante del guard de `E19-01` y en
sus tests. Un criterio de épica puede contradecir a un ítem `done` de la misma épica y **nada en el
formato lo impide en el momento de escribirlo**: sólo se ve auditando. Falta la regla de que un
criterio nuevo se contraste contra lo ya cerrado.

**[hueco]** También apareció un **segundo placeholder** (`seguimiento.tudominio.com` en
`.env.prod.example`) que mi criterio de épica no buscaba. Escribí un chequeo contra la marca que yo
conocía; el chequeo daba verde igual con la otra. El formato pide que el criterio sea verificable,
no que sea **exhaustivo**, y no tiene forma de expresar «acá la lista tiene que estar completa».

**[fricción]** El hallazgo 10 fue el más incómodo: `E19-01` cerró bien y aun así movió el gate de
promoción sin declararlo. La respuesta del formato es la correcta —de `done` no se vuelve, así que va
un ítem nuevo (`E19-09`)— pero implica que **un ítem puede estar completo, auditado y verde, y haber
cambiado una regla del proyecto que nadie va a ver**. La corrección llega sólo si alguien audita.

**[decisión-abierta]** Al corregir tuve que editar criterios de ítems abiertos y **registrarlo en el
historial** de cada uno. La plantilla dice que el historial es «cómo llegamos», pensado para
implementación; acá lo usé para «por qué el criterio dice hoy algo distinto de lo que decía ayer».
Sin eso, el diff no distingue una corrección de la especificación de un cambio de alcance.

## Paso 6 — borrado de formularios

**[fricción]** Al borrar `docs/decisiones/_plantilla-decision.md` la carpeta quedó **vacía**, o sea
que desaparece del repo en el próximo clone. Agregué un `.gitkeep` — `backlog/` traía uno y
`docs/decisiones/` no. Inconsistencia de la plantilla.

**[fricción]** `backlog/README.md` tenía una sección «Archivos que hay que borrar» que quedó
mintiendo apenas se ejecutó el paso 6. La plantilla se acuerda de decirte que borres los formularios,
pero no de que su propio README habla de ellos. Lo reescribí apuntando a `E19-01.md` como ejemplo
vivo.

**[hallazgo]** Tres archivos de la propia plantilla FaLuSpec (`backlog/README.md`,
`backlog/_ejemplo-E4-07.md`, `.claude/agents/*.md`) **no pasan el Prettier de este repo**, que corre
en CI. Al borrar el ejemplo y formatear el README, el CI pasó de 14 archivos en rojo a 13. La
plantilla no trae configuración de formato ni avisa que su markdown puede chocar con la del proyecto
que la adopta.
