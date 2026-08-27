"""Genera las vistas de bloqueos, resumen por épica y story map (VISTAS.md §3, §4 y §6).

Scripts de un solo uso, para cerrar la fase 1. NO es el CLI: no valida y asume
que el backlog está bien formado.

    python generar-vistas.py <directorio-backlog> <directorio-salida>
"""

import io
import os
import re
import sys

CAMPO = re.compile(r"^([a-z_]+):\s*(.*)$")
ESTADOS = ["todo", "wip", "blocked", "done"]


def frontmatter(ruta):
    campos = {}
    with io.open(ruta, encoding="utf-8") as f:
        if f.readline().strip() != "---":
            return campos
        for linea in f:
            if linea.strip() == "---":
                break
            m = CAMPO.match(linea.rstrip("\n"))
            if m:
                campos[m.group(1)] = m.group(2).strip()
    return campos


def clave_item(id_):
    m = re.match(r"E(\d+)-(\d+)$", id_)
    return (int(m.group(1)), int(m.group(2)))


def leer(directorio):
    epicas, items = {}, []
    for nombre in sorted(os.listdir(directorio)):
        if not nombre.endswith(".md") or nombre.startswith("_") or nombre == "README.md":
            continue
        campos = frontmatter(os.path.join(directorio, nombre))
        id_ = campos.get("id")
        if not id_:
            continue
        if "-" in id_:
            items.append(campos)
        else:
            epicas[id_] = campos
    return epicas, sorted(items, key=lambda i: clave_item(i["id"]))


def escribir(path, lineas):
    texto = "\n".join(lineas).rstrip("\n") + "\n"
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


CABECERA = ["<!-- generado desde backlog/ — no editar a mano -->", ""]


def bloqueos(epicas, items, salida):
    """Una fila por causa. Un ítem sin bloqueado_por propio hereda el de su épica."""
    grupos = {}
    for i in items:
        if i.get("estado") != "blocked":
            continue
        causa = i.get("bloqueado_por") or epicas.get(i.get("epica"), {}).get("bloqueado_por")
        if not causa:
            continue
        grupos.setdefault(causa, []).append(i)

    filas = []
    for causa, miembros in grupos.items():
        desde = min(m.get("fecha_estado", "") for m in miembros)
        ids = " · ".join(m["id"] for m in sorted(miembros, key=lambda m: clave_item(m["id"])))
        filas.append((desde, causa, ids))
    filas.sort()  # por Desde, la más vieja arriba

    out = CABECERA + ["# Bloqueos", "", "| Qué se espera | Ítems | Desde |", "|---|---|---|"]
    out += ["| {} | {} | {} |".format(c, ids, d) for d, c, ids in filas]
    escribir(salida, out)


def resumen(epicas, items, salida):
    out = CABECERA + [
        "# Resumen por épica",
        "",
        "| Épica | Título | todo | wip | blocked | done | Total | Cerrado |",
        "|---|---|---|---|---|---|---|---|",
    ]
    totales = dict.fromkeys(ESTADOS, 0)
    for eid in sorted(epicas, key=lambda e: int(e[1:])):
        propios = [i for i in items if i.get("epica") == eid]
        if not propios:
            continue
        cuenta = {e: sum(1 for i in propios if i.get("estado") == e) for e in ESTADOS}
        for e in ESTADOS:
            totales[e] += cuenta[e]
        out.append(
            "| {} | {} | {} | {} | {} | {} | {} | {}/{} |".format(
                eid,
                epicas[eid]["titulo"],
                cuenta["todo"],
                cuenta["wip"],
                cuenta["blocked"],
                cuenta["done"],
                len(propios),
                cuenta["done"],
                len(propios),
            )
        )
    total = sum(totales.values())
    out.append(
        "| **Total** | | {} | {} | {} | {} | {} | {}/{} |".format(
            totales["todo"],
            totales["wip"],
            totales["blocked"],
            totales["done"],
            total,
            totales["done"],
            total,
        )
    )
    escribir(salida, out)


def storymap(epicas, items, salida):
    """Columnas: los hitos que los ítems declaran, más `sin hito` al final.

    Los hitos declarados en el plan que no tienen ningún ítem no aparecen: esta
    vista sólo lee `backlog/`, y el plan vive en otro lado. Ver HALLAZGOS V4.
    """
    hitos = sorted({i["hito"] for i in items if i.get("hito")}, key=lambda h: int(h[1:]))
    columnas = hitos + ["sin hito"]

    out = CABECERA + ["# Story map", ""]
    out.append("| Épica | " + " | ".join(columnas) + " |")
    out.append("|" + "---|" * (len(columnas) + 1))
    for eid in sorted(epicas, key=lambda e: int(e[1:])):
        propios = [i for i in items if i.get("epica") == eid]
        if not propios:
            continue
        celdas = []
        for col in columnas:
            en_col = [i for i in propios if (i.get("hito") or "sin hito") == col]
            celdas.append(" · ".join(i["id"] for i in en_col) if en_col else "—")
        out.append("| {} | {} |".format(eid, " | ".join(celdas)))
    escribir(salida, out)


if __name__ == "__main__":
    origen, destino = sys.argv[1], sys.argv[2]
    eps, its = leer(origen)
    bloqueos(eps, its, os.path.join(destino, "GENERADA-bloqueos.md"))
    resumen(eps, its, os.path.join(destino, "GENERADA-resumen.md"))
    storymap(eps, its, os.path.join(destino, "GENERADA-storymap.md"))
