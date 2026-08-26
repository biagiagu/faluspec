# Prueba 002 — Arranque desde la plantilla

> **Esto es el gate de la fase 0**, no un ejercicio más. El gate dice: *un proyecto nuevo arranca
> desde la plantilla en horas*. No se puede declarar cumplido sin haberlo hecho una vez y medido.

**Proyecto elegido:** `c:\Proyectos\011-SeguimientoDePedidos`.

---

## Qué prueba esta corrida, y qué no

**Prueba:** que la constitución se pueda completar con datos reales · que los formularios y el ejemplo
alcancen para escribir ítems sin consultar la especificación · que un ítem llegue a `done` con su
ancla resolviendo y su test corriendo · que el verificador encuentre algo o confirme que no hay nada.

**No prueba el «en horas» limpio.** La información que pide la constitución de 011 ya existe dispersa
en su `CLAUDE.md`, su `docs/ESTRATEGIA_GIT.md` y su `docs/`. Vas a ir más rápido que alguien que
arranca de cero. **El tiempo que midas es un piso optimista, y hay que reportarlo como tal.**

**Tampoco prueba la escala.** Migrar las 18 épicas existentes es otra cosa y pertenece a la fase 1.

## Precondiciones

1. **Sesión limpia.** Sin el prompt de continuación de FaLuSpec, sin esta conversación. El agente
   arranca con la plantilla copiada y nada más. Si necesita que le expliquen el formato, la plantilla
   falló — y eso es un hallazgo, no un contratiempo.
2. **El backlog viejo se congela.** `docs/BACKLOG.md` de 011 pasa a ser histórico: no se toca, no se
   migra, no se actualiza. El formato nuevo manda de `E19` en adelante. Dos fuentes vivas para lo
   mismo es el error que el formato existe para evitar.
3. **Rama propia.** El trabajo va a una rama corta, no a `develop` directo. 011 tiene su propia
   estrategia de ramas y esta prueba no la altera.

## La línea de llegada

Definida **antes** de empezar, para que no sea autoevaluación. El arranque está hecho cuando:

- [ ] `docs/CONSTITUCION.md` no tiene ningún `<hueco>` sin completar
- [ ] `docs/PLAN.md` tiene al menos un hito con su **significado** escrito, no una lista de entregables
- [ ] Existe la épica `E19` y al menos 3 ítems con criterios completos
- [ ] **Un ítem llegó a `done` de verdad**: código, test que existe y corre en verde, ancla que resuelve
- [ ] El agente `verificador` corrió sobre el backlog y su reporte quedó registrado
- [ ] Los archivos `_plantilla-*` y `_ejemplo-*` están borrados

El cuarto punto es el que importa. Sin él sólo se probó que se pueden llenar formularios.

### El ítem a cerrar

**Sugerido: `E19-01.1`** — que producción no arranque con el dominio heredado. Es un cambio chico en
el esquema de configuración más un test unitario; no necesita base de datos levantada ni credenciales
de nadie, y cierra un riesgo de despliegue real.

Los criterios de la prueba 001 sirven como punto de partida, pero **reescribilos desde la plantilla**
en vez de copiarlos: lo que se está probando es si la plantilla alcanza para producirlos.

## La regla de oro

**No arregles la plantilla mientras la usás.** En cuanto la corregís sobre la marcha, dejás de medir.
Anotá la fricción y seguí adelante con lo que hay. Las correcciones son el movimiento siguiente.

Lo mismo con la especificación: si te falta una regla, anotá que faltó y decidí algo. No vuelvas a
FaLuSpec a agregarla en el medio.

## Qué medir

| Dato | Por qué |
|---|---|
| Tiempo hasta cada punto de la línea de llegada | El gate dice «horas». Dos horas pasa; dos días no. |
| Cuántas veces hubo que abrir `ESPECIFICACION.md` | La plantilla debería alcanzar. Cada consulta es un hueco de la plantilla. |
| Qué hueco de la constitución no se supo llenar | O sobra, o está mal preguntado. |
| Qué preguntó el agente | Cada pregunta es algo que la plantilla debería haber respondido sola. |
| Dónde se trabó | Lo más valioso y lo que más rápido se olvida. Anotalo en el momento. |

## Al terminar

Escribir `HALLAZGOS.md` en este mismo directorio, con la forma de la prueba 001: qué pasó, qué
aguantó, qué crujió, y una tabla de qué se propone cambiar y dónde.

Después, y sólo después, decidir:

- **Si el gate pasó** — la fase 0 cierra y empieza la 1 (un archivo por ítem como fuente, vistas
  generadas).
- **Si no pasó** — los hallazgos dicen qué le falta a la plantilla. Se arregla y se vuelve a correr
  con otro proyecto, porque 011 ya quedó quemado como caso: la segunda vez nadie arranca de nuevo.
