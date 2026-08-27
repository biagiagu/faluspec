# Hallazgos de la prueba 003 — el gate de la fase 1

**Corrida:** 2026-08-26 · backlog `E19` de `011-SeguimientoDePedidos`, 9 ítems.

**El gate pasa.** La tabla generada coincide **byte a byte** con la escrita a mano.

## Cómo se corrió

1. Se escribió la tabla a mano leyendo los nueve ítems, siguiendo `VISTAS.md` §2 —
   [`A-MANO.md`](A-MANO.md).
2. Se **commiteó antes** de escribir el generador, para que quede registrado que se escribió sin
   mirar su salida.
3. Se escribió [`generar-tabla.py`](generar-tabla.py), script de un solo uso: no valida, no maneja
   errores, no es el CLI.
4. `diff` entre las dos.

Además se corrió el generador dos veces y se comparó consigo mismo: **determinista**.

---

## H1 · El determinismo byte a byte no depende sólo del algoritmo

**La primera corrida falló el diff con el contenido correcto.** Cada carácter acentuado y cada raya
aparecían mal: el generador escribía a `stdout`, y la consola de Windows lo codificó en cp1252 en vez
de UTF-8. El texto era idéntico; los bytes no.

Y hay una segunda mitad, peor, que este repo tiene activa: **`core.autocrlf = true` y no hay
`.gitattributes`**. Al clonar, los `.md` llegan con CRLF; el generador escribe LF; el diff da
diferencia en cada regeneración, y en un CI sobre Linux da distinto que en la máquina de quien
escribe. **El gate de la fase 1 —«se regenera y coincide»— fallaría por un motivo que no tiene nada
que ver con el backlog.**

**Aplicado:** `VISTAS.md` §1.1 gana una regla — una vista declara su codificación (UTF-8 sin BOM) y su
fin de línea (LF), y no los hereda del entorno. Y la plantilla trae un `.gitattributes` que lo fija
para el repo entero.

## H2 · «Ordenado por identificador» es ambiguo, y la respuesta obvia es la incorrecta

`E19-01` y `E4-07`: ordenados como texto, `E19-01` va primero. Ordenados como corresponde, `E4-07`.
El generador necesitó una función de orden explícita que parsea los dos números.

Esta prueba **no lo habría descubierto** —hay una sola épica y los identificadores son contiguos— si
no fuera porque hubo que escribir el código. Escribir el generador es lo que obliga a desambiguar.

**Aplicado:** `VISTAS.md` dice ahora **orden numérico**, y lo dice en las cinco vistas.

## H3 · El formato no declara qué subconjunto de YAML es el encabezado

El parser del generador son cinco líneas porque asume `clave: valor` de una sola línea. Funcionó con
los nueve ítems, incluido un `bloqueado_por` de tres renglones de prosa con puntos y comas adentro
—que entró porque estaba en **una** línea física.

Nada dice que tenga que ser así. Si mañana alguien escribe un valor multilínea con `|`, o una lista en
formato de bloque, el generador se rompe y el ítem sigue siendo válido para cualquier lector humano.

**Propuesta, sin aplicar:** declarar el subconjunto —`clave: valor` en una línea, listas en línea con
corchetes— antes de escribir el CLI. Es una decisión que condiciona el parser, y hoy está implícita en
que nadie escribió otra cosa todavía.

## H4 · Hay dos formas de decir «sin dependencias»

Los ítems de 011 escriben `depende_de: []`; el formato también admite omitir el campo. Las dos
producen la misma celda, así que para la vista da igual — pero un validador va a tener que aceptar las
dos, o el formato va a tener que elegir una.

## H5 · El backlog está escrito contra una versión anterior del formato, y nadie lo nota

Los nueve ítems se escribieron con la v0.2/0.3: no tienen `hito`, y no todos tienen `## Impacto`. La
tabla salió bien igual, porque no usa esos campos — **la vista no tuvo forma de saber que estaba
leyendo un backlog viejo**.

Es la decisión abierta §9.3 volviéndose concreta: sin una versión declarada, un generador no sabe qué
campos esperar, y un validador no sabe qué reglas aplicar. Ya hay cuatro versiones del formato.

---

## Lo que este gate **no** probó

Hay que decirlo, porque el resultado es fácil de sobrevender:

- **Una sola épica.** El agrupamiento por épica se ejercitó con un grupo. El orden entre épicas no se
  probó nunca (H2 salió de escribir el código, no de la corrida).
- **Sin huecos de numeración.** Los nueve ítems son contiguos. La abreviatura de rangos del story map
  —que prohíbe abreviar salteando un hueco— no se ejercitó.
- **Una sola vista de las cinco.** Bloqueos, resumen y story map no se generaron; cobertura no se
  puede sin resolver anclas.
- **Nueve ítems.** A esta escala, la tabla a mano es fácil de acertar. El valor de regenerarla aparece
  con cientos.

El gate estaba definido así de antemano y se cumplió. Pero la evidencia que dejó es **más angosta que
la afirmación «las vistas se generan»**, y conviene no olvidarlo cuando se decida el alcance de la
fase 2.
