# Hallazgos de la prueba 005 — el gate de la fase 2

**Corrida:** 2026-08-26 · `faluspec validate` contra `011-SeguimientoDePedidos`, backlog `E19`.

El gate de la fase 2 tiene dos mitades: **el validador atrapa una regresión real** y **corre en CI**.
La primera está cumplida y demostrada. La segunda no, y el motivo no es técnico.

---

## La regresión

Se renombró un símbolo en el código, como haría cualquier refactor:

```
GOOGLE_HD_PLACEHOLDER  →  PLACEHOLDER_DOMINIO
```

El rename es consistente: las cuatro apariciones cambian juntas.

| Herramienta | Qué dijo |
|---|---|
| `tsc --noEmit` | nada — compila |
| tests | seguirían pasando: el código es equivalente |
| lint, format | nada |
| **`faluspec validate`** | **`E19-01.1 · el ancla no resuelve: GOOGLE_HD_PLACEHOLDER no está declarado`** |

Eso es exactamente la regresión que el formato existe para atrapar: **el código está bien y la
especificación quedó mintiendo**. Ninguna otra herramienta del stack puede verla, porque ninguna
guarda dónde vive cada criterio. Es la decisión fundacional —anclas a símbolos, nunca a números de
línea— dando su primer resultado concreto, catorce meses de proyecto después de enunciarse.

Tras revertir el rename, el backlog vuelve a **0 errores · 21 anclas resueltas · 10 declaradas
`ninguna`**.

## Lo que encontró en el camino

La primera corrida real sobre un backlog escrito a mano dio dos errores ciertos:

1. **`E19-08.2` anclaba a `apps/web/public`**, que es un directorio. §2.3 exige la barra final; sin
   ella se busca un archivo con ese nombre y no existe. Lo escribí yo a mano en la prueba 001 y
   sobrevivió a dos revisiones humanas.
2. **`E19-01` estaba `done` sin declarar impacto.** Se escribió contra la v0.3, antes de que §3.5
   existiera. Y el impacto que faltaba no era trivial: ese ítem **movió el gate de promoción a test**,
   cosa que estaba sólo en su historial en prosa. La regla nueva encontró justo el caso que la
   motivó.

Más dos avisos: los `bloqueado_por` de 151 y 206 caracteres — el hallazgo W2 de la prueba 004,
detectado solo.

---

## La mitad que falta: correr en CI

**El paso está escrito en el `ci.yml` de 011, y comentado.** No hay de dónde bajar el CLI: vive en
este repo, que no tiene remoto ni paquete publicado.

No se dejó activo con `continue-on-error`. **Un paso que dice que valida y no valida es peor que no
tenerlo**: da la señal de seguridad sin el respaldo, que es la clase de mentira contra la que se
diseñó todo esto.

### El plan tenía una dependencia que nadie vio

El gate de la fase 2 —«el validador corre en CI»— **necesita que el CLI sea instalable**, y la
distribución es fase 3. Las tres fases se escribieron como una secuencia y no lo son del todo.

No es un error de la herramienta ni un problema de código: es planificación. Las salidas posibles:

| Salida | Costo | Qué implica |
|---|---|---|
| **Publicar el CLI** (adelantar fase 3) | remoto + npm + versionado | El gate se cumple de verdad, y para cualquiera |
| **Vendorizar** el CLI compilado en el repo que lo usa | se desincroniza, contamina el repo adoptante | El gate se cumple sólo ahí |
| **Dejarlo así** | ninguno | La fase 2 queda con su gate a medias, declarado |

Ninguna es obviamente correcta, y la decisión no es técnica: depende de si FaLuSpec va a ser una
herramienta que otros usan o el método de un repo. Eso es exactamente lo que la fase 3 tenía que
resolver, así que la dependencia estaba escondida ahí desde el principio.

---

## Estado de la fase 2

| | |
|---|---|
| El validador atrapa una regresión real | ✅ demostrado |
| Corre en CI | ❌ bloqueado por distribución, no por capacidad |
| `validate` | ✅ estructura + anclas |
| `init` · `map` · `status` · `archive` | ❌ |

`map` y `status` son las vistas de la fase 1, que ya están definidas y probadas: pasarlas al CLI es
trabajo mecánico. `init` es copiar la plantilla. `archive` necesita antes decidir qué significa
archivar, que el formato todavía no dice.
