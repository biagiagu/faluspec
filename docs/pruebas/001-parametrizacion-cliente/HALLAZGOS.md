# Hallazgos de la prueba 001

Qué pasó cuando la spec v0.1 se estrelló contra trabajo real no especificado.

**Lo escrito:** 1 épica, 1 hito, 8 ítems, 21 criterios.
**Lo que salió:** 10 criterios `manual` (48%), 5 sin ancla posible (24%), 2 con un tipo de
verificación que la spec no tiene, y 7 tests nombrados que todavía no existen.

**Veredicto: el formato aguanta.** Ningún constructo tuvo que ser forzado ni inventado. Pero el caso
expuso que la v0.1 fue escrita pensando en **funcionalidad nueva**, y este trabajo es **configuración
sobre código que ya existe**. Ahí aparecen los siete huecos de abajo.

---

## 1 · Falta un tipo de verificación para el chequeo estático

Tres criterios se comprueban recorriendo el repositorio, no ejecutando el sistema: que el placeholder
de dominio no sobreviva en ningún archivo, que ningún secreto viaje versionado, que no quede un
`TODO(cliente)`. Eso no es `unit`, ni `integracion`, ni `e2e`, ni `manual` — es un grep que corre en CI
y falla el build.

Escribí `estatica` porque no había ninguna opción honesta. **Propuesta: agregarlo a §2.4.** Es el tipo
que corresponde a los criterios que afirman algo sobre el repositorio y no sobre el sistema corriendo,
y es barato de validar.

## 2 · Hay criterios sin ancla posible por naturaleza, no por falta de implementación

§2.2 contempla un solo motivo para que falte el ancla: todavía no se implementó. Este caso encontró
tres motivos más, todos permanentes:

| Criterio | Por qué nunca va a tener símbolo |
|---|---|
| Los dominios resuelven por DNS | El estado vive en el proveedor de DNS, no en el repo |
| Los íconos de la app instalada | Son archivos binarios |
| El placeholder no sobrevive en ningún archivo | El alcance es el repositorio entero, no un lugar |

La regla §2.2.3 —«si el ítem está `done`, tiene al menos un ancla»— haría **invalidables para siempre**
a los ítems E19-06 y E19-08, que son trabajo perfectamente legítimo. Como está escrita hoy, la única
salida sería inventar un ancla, que es exactamente lo que la regla quería evitar.

**Propuesta:** que la ausencia de ancla sea válida cuando está **declarada y justificada**, del mismo
modo que `manual` es un valor y no un pendiente. Se gana la misma métrica que dio `manual`: qué
porcentaje del proyecto no vive en el código.

## 3 · El ancla no llega hasta donde está el dato

El valor a parametrizar es una clave dentro de un esquema de configuración, no el esquema entero. La
gramática `archivo#símbolo` obliga a anclar al esquema completo: si alguien toca cualquier otro campo,
el ancla sigue resolviendo igual y no avisa nada. El ancla quedó **más gruesa que el criterio**.

**Propuesta:** admitir ruta de símbolo con punto (`#esquema.CLAVE`), resolviendo lo que el parser
pueda y tratando el resto como no resoluble. **Con una advertencia:** éste es el borde donde el ancla
empieza a parecerse a un número de línea. Si para localizar el criterio hace falta bajar más que un
nivel, probablemente el problema sea el diseño del código y no el del ancla.

## 4 · No está decidido si el ancla puede apuntar a un símbolo no exportado

Cuatro anclas de este caso apuntan a constantes de módulo que no se exportan. §2.3 dice «un símbolo
existente» sin aclarar cuáles cuentan. Para el validador la diferencia no es menor: leer la tabla de
exports es trivial, parsear el módulo entero no.

**Hay que decidirlo antes de la fase 2**, porque condiciona la implementación. Mi voto: sí, valen —
justamente el dato a parametrizar suele ser una constante privada.

## 5 · Un criterio puede afirmar algo sobre su propia suite de tests

Dos criterios de E19-04 dicen que cierto chequeo vuelva a exigir una tabla que hoy está excluida a
propósito. El ancla y la verificación **apuntan al mismo archivo**: el trabajo real *es* modificar ese
test. Es legítimo y frecuente al levantar deuda, pero la spec no dice si vale.

**Propuesta:** decir que sí, y que en ese caso el ancla es redundante y puede omitirse.

## 6 · `blocked` no dice qué se está esperando

Tres ítems están bloqueados esperando una respuesta del cliente. §7 manda la causa al historial, y
eso deja el bloqueo **fuera de toda vista**: no se puede listar «qué estoy esperando y de quién» sin
leer prosa ítem por ítem. Es la pregunta más frecuente de una reunión de estado.

El backlog del proyecto de origen lo resolvía metiendo un nombre propio en la columna de dependencias,
que es un abuso de esa columna pero responde la pregunta.

**Propuesta mínima:** un campo opcional `bloqueado_por`, texto libre, en el encabezado. No convierte
esto en un CRM y hace la vista posible.

## 7 · `verifica` funciona como encargo, no sólo como registro

Efecto no buscado: escribir los criterios produjo **siete nombres de test que todavía no existen**.
La spec presenta `verifica` como algo que se completa al implementar; en la práctica, escribirlo antes
convierte cada criterio en una orden de trabajo ejecutable — el nombre del test es parte de la
especificación, no de la implementación.

**Propuesta:** decirlo explícitamente en §2.4. Es una de las cosas que el formato hace y que no está
declarada.

---

## Lo que no dio evidencia

- **§9.1, plano vs. por épica.** Con 8 ítems de una sola épica, plano es cómodo y no prueba nada. La
  decisión necesita un caso con varias épicas vivas.
- **§9.2, criterios compartidos.** No apareció la necesidad. Los criterios de este caso se repiten en
  espíritu («el dato es del cliente») pero cada uno tiene su ancla distinta.

## Lo que funcionó sin fricción

- **La gramática de identificadores.** Elegir `E19` fue mirar cuál era la última épica usada. Cero
  ambigüedad.
- **El hito por significado.** Obligó a escribir «nada de lo que ve viene del proyecto del que se copió
  el repo», que decide casos dudosos. La lista de checkboxes de la que salió este caso no lo hacía.
- **Historia separada del criterio (§3.4).** El material de origen mezclaba las dos cosas en una celda
  de tabla; separarlas fue mecánico y el resultado se lee mejor.
- **`manual` como valor legítimo.** Sostiene el 48% de esta épica. Si no existiera, la mitad del caso
  sería inexpresable o mentiroso.

---

## Qué se hizo con esto

Los siete hallazgos se aceptaron y están aplicados en la **especificación v0.2**. El caso de arriba se
reescribió con la sintaxis nueva, así que sirve además como ejemplo de las formas que la 0.2 agrega.

| Hallazgo | Cómo quedó en la spec |
|---|---|
| 1 · chequeo estático | Tipo `estatica` en §2.4 |
| 2 · ancla imposible | `ancla: ninguna — <motivo>`, declaración válida en `done` (§2.2, §2.3) |
| 3 · granularidad | Un nivel de propiedad dentro del símbolo, con la advertencia (§2.3) |
| 4 · símbolos privados | Valen, dicho explícitamente (§2.3) |
| 5 · criterio sobre su suite | Es uno de los tres motivos de `ninguna` (§2.3) |
| 6 · bloqueo opaco | Campo `bloqueado_por`, obligatorio en `blocked` (§3.2, §3.3) |
| 7 · encargo de test | §2.4, «la verificación se escribe antes de implementar» |

También apareció uno **tardío**, al migrar el caso a la sintaxis nueva: las reglas de validez de §2.2
están escritas asumiendo que el contenedor del criterio es un **ítem** («si el ítem que lo contiene
está `done`…»). Los criterios de épica —que §4 sí admite— quedan sin régimen: una épica no tiene
estado propio, así que nunca dispara la exigencia de ancla. Quedó anotado como decisión abierta §9.6,
no inventado sobre la marcha.
