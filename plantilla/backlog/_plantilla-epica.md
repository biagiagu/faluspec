---
id: E<n>
title: <Tema que agrupa, no una tarea>
blocked_by: <opcional: sólo si todos o casi todos sus ítems esperan lo mismo, de la misma persona>
---

## Qué agrupa

<Qué tienen en común sus ítems. Si no se puede decir en dos líneas, probablemente sean dos épicas.>

## Criteria

<Opcional. Sólo criterios que afirmen algo del conjunto y que ningún ítem suelto pueda cumplir por
sí mismo. Si el criterio es de un ítem, va en ese ítem.>

### E<n>.a — <título>

**Dado** <situación>, **cuando** <acción>, **entonces** <resultado observable>.

- anchor: `<ruta#simbolo>` · `<ruta>` · `ninguna — <motivo>`
- verify: `<unit | integration | e2e | static | manual>` → `<test concreto>`

---

**Una épica no tiene estado propio.** Su avance se deriva del estado de sus ítems. Guardar un estado
acá invita a que contradiga a sus partes.

`blocked_by` sí puede ir acá, y no es estado: es la causa común, dicha una vez en vez de repetida
en cada ítem. Usalo cuando la épica entera está parada esperando a un tercero — sin eso, el dato más
importante de esa épica sólo se ve abriendo sus ítems de a uno.
