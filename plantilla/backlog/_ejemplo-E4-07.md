---
id: E4-07
epic: E4
title: Reintento de notificaciones fallidas
priority: P1
status: done
status_since: 2026-03-14
depends_on: [E4-03]
milestone: H1
---

> **Ejemplo.** Es el mismo caso que usa la especificación como átomo, desarrollado hasta un ítem
> completo y cerrado. Muestra cómo se ve un `done` con su historial escrito.
>
> Su `depends_on` apunta a un ítem que no existe acá, porque el ejemplo está solo: un verificador te
> lo reportaría, y tendría razón. Borralo.

## Story

Como responsable de la operación, quiero que un envío fallido se reintente solo, para no tener que
revisar a mano qué no salió.

## Criteria

### E4-07.1 — Reintento con espera creciente

**Dado** un envío que falló por error de red, **cuando** el reintento se programa,
**entonces** la espera es el doble de la anterior, con un techo de 30 minutos.

- anchor: `src/notificaciones/reintento.ts#calcularEspera`
- verify: `unit` → `reintento.test.ts::espera creciente con techo`

### E4-07.2 — Un fallo permanente no se reintenta

**Dado** un envío rechazado por dirección inválida, **cuando** termina el intento,
**entonces** no se programa ningún reintento y el envío queda marcado como fallido definitivo.

- anchor: `src/notificaciones/reintento.ts#esReintentable`
- verify: `unit` → `reintento.test.ts::un rechazo permanente no se reintenta`

### E4-07.3 — El contenido del envío no queda en el log

**Dado** un envío que falla, **cuando** se registra el error,
**entonces** el registro tiene el identificador del envío y el motivo, y ningún dato de la persona
destinataria.

- anchor: `src/notificaciones/reintento.ts#registrarFallo`
- verify: `unit` → `reintento.test.ts::el log no incluye datos de la persona destinataria`

### E4-07.4 — La cola sobrevive a un reinicio

**Dado** reintentos pendientes, **cuando** el servicio se reinicia,
**entonces** los reintentos siguen programados y ninguno se pierde ni se duplica.

- anchor: `src/notificaciones/cola.ts#restaurarPendientes`
- verify: `integration` → `cola.itest.ts::los pendientes sobreviven al reinicio`

### E4-07.5 — El tope de reintentos es configurable sin tocar el código

**Dado** el tope de reintentos, **cuando** se lo cambia por configuración,
**entonces** el nuevo valor rige en el siguiente arranque.

- anchor: `none` — el valor vive en la configuración del entorno, fuera del repositorio
- verify: `manual`

## Impact

Ninguno. El reintento es interno del envío de notificaciones: no cambia el contrato de ningún otro
ítem cerrado ni el comportamiento de ningún ambiente.

## History

**2026-03-14 — cerrado.** El techo de 30 minutos salió de que más allá de eso el aviso ya no le sirve
a nadie: llega cuando el problema se resolvió por otra vía.

**Se descartó** hacer el reintento configurable por tipo de notificación. Habría duplicado la lógica
de espera en tres lugares para un caso que todavía no pidió nadie. Si aparece, es un ítem nuevo.

**Quedó afuera** el aviso al equipo cuando un envío agota sus reintentos. Es trabajo real y no estaba
en ningún criterio de este ítem — se anotó como `E4-11`.
