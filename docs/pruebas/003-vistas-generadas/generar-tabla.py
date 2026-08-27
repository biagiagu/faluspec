"""Genera la tabla de backlog de VISTAS.md §2 desde un directorio de ítems.

Script de un solo uso, para el gate de la fase 1. NO es el CLI: no valida, no
maneja errores, y asume que el backlog está bien formado. Su único trabajo es
producir la vista para poder compararla con la escrita a mano.

    python generar-tabla.py <directorio-backlog> <archivo-salida>
"""

import io
import os
import re
import sys

CAMPO = re.compile(r"^([a-z_]+):\s*(.*)$")


def frontmatter(ruta):
    """Devuelve el encabezado del archivo como dict. Sin dependencias externas:
    el subconjunto de YAML que usa FaLuSpec son pares clave: valor de una línea."""
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


def lista(valor):
    """`[E19-01, E19-02]` -> ['E19-01', 'E19-02']. Vacío o ausente -> []."""
    if not valor:
        return []
    return [x.strip() for x in valor.strip("[]").split(",") if x.strip()]


def clave_item(id_):
    """Orden por identificador: E4-07 antes que E19-01, y E19-2 antes que E19-10."""
    m = re.match(r"E(\d+)-(\d+)$", id_)
    return (int(m.group(1)), int(m.group(2)))


def main(directorio, salida_path):
    epicas, items = {}, []
    for nombre in os.listdir(directorio):
        if not nombre.endswith(".md") or nombre.startswith("_"):
            continue
        campos = frontmatter(os.path.join(directorio, nombre))
        id_ = campos.get("id")
        if not id_:
            continue
        if "-" in id_:
            items.append(campos)
        else:
            epicas[id_] = campos

    salida = ["<!-- generado desde backlog/ — no editar a mano -->", "", "# Backlog", ""]

    for eid in sorted(epicas, key=lambda e: int(e[1:])):
        propios = sorted(
            [i for i in items if i.get("epica") == eid], key=lambda i: clave_item(i["id"])
        )
        if not propios:
            continue
        salida.append("## {} — {}".format(eid, epicas[eid]["titulo"]))
        salida.append("")
        salida.append("| ID | Título | Prio | Estado | Desde | Depende de |")
        salida.append("|---|---|---|---|---|---|")
        for i in propios:
            deps = lista(i.get("depende_de")) or ["—"]
            salida.append(
                "| {} | {} | {} | {} | {} | {} |".format(
                    i["id"],
                    i["titulo"],
                    i["prioridad"],
                    i["estado"],
                    i.get("fecha_estado") or "—",
                    ", ".join(deps),
                )
            )
        salida.append("")

    texto = "\n".join(salida).rstrip("\n") + "\n"
    # UTF-8 sin BOM y saltos LF, explícitos. Si esto queda librado al entorno, la
    # misma vista generada en dos máquinas no coincide byte a byte — y entonces la
    # regla de determinismo de VISTAS.md §1.1 no se cumple por motivos que no
    # tienen nada que ver con el backlog.
    with io.open(salida_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
