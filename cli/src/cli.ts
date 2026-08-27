#!/usr/bin/env node
/**
 * faluspec — valida un backlog FaLuSpec.
 *
 * Por ahora sólo `validate`. `init`, `map`, `status` y `archive` vienen después:
 * el gate de esta fase es que el validador atrape una regresión real, no que el
 * CLI esté completo.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { leerBacklog } from "./formato/backlog.js";
import { validarEstructura, comparar, type Hallazgo } from "./reglas/estructura.js";
import { validarAnclas } from "./reglas/anclas.js";

const VERSIONES_CONOCIDAS = new Set(["0.5"]);

function main(argv: string[]): number {
  const [comando = "", ...resto] = argv;
  if (comando !== "validate") {
    process.stderr.write("uso: faluspec validate [directorio del proyecto]\n");
    return 2;
  }
  return validate(resolve(resto[0] ?? "."));
}

function validate(raiz: string): number {
  const version = leerVersion(raiz);
  if (version === null) {
    process.stderr.write(
      `no encuentro \`.faluspec\` en ${raiz}\n` +
        "  Un proyecto declara contra qué versión del formato está escrito (§10).\n" +
        "  Crealo con una línea: 0.5\n",
    );
    return 2;
  }
  if (!VERSIONES_CONOCIDAS.has(version)) {
    process.stderr.write(
      `\`.faluspec\` declara la versión ${version}, que esta herramienta no conoce.\n`,
    );
    return 2;
  }

  const directorio = join(raiz, "backlog");
  if (!existsSync(directorio)) {
    process.stderr.write(`no encuentro el directorio ${directorio}\n`);
    return 2;
  }

  const backlog = leerBacklog(directorio);
  const anclas = validarAnclas(backlog, raiz);
  const hallazgos = [...validarEstructura(backlog), ...anclas.hallazgos].sort(
    (a, b) =>
      Number(a.gravedad === "aviso") - Number(b.gravedad === "aviso") ||
      comparar(a.donde, b.donde) ||
      a.regla.localeCompare(b.regla),
  );

  const errores = hallazgos.filter((h) => h.gravedad === "error").length;
  const avisos = hallazgos.length - errores;

  for (const h of hallazgos) process.stdout.write(formatear(h) + "\n");

  const { resueltas, aproximadas, ninguna, rotas } = anclas.resumen;
  const cuantas =
    `anclas: ${resueltas} resueltas` +
    (aproximadas ? ` · ${aproximadas} aproximadas` : "") +
    (ninguna ? ` · ${ninguna} declaradas ninguna` : "") +
    (rotas ? ` · ${rotas} ROTAS` : "");
  const cuantos = `${backlog.items.size} ítems · ${backlog.epicas.size} épicas · ${cuantas}`;
  if (hallazgos.length === 0) {
    process.stdout.write(`backlog válido — ${cuantos}\n`);
  } else {
    process.stdout.write(`\n${errores} error(es) · ${avisos} aviso(s) — ${cuantos}\n`);
  }
  return errores > 0 ? 1 : 0;
}

function formatear(h: Hallazgo): string {
  const sitio = h.linea ? `${h.archivo}:${h.linea}` : h.archivo;
  const marca = h.gravedad === "error" ? "error" : "aviso";
  return `${marca}  ${h.donde}  ${h.mensaje}\n       ${sitio} · ${h.regla}`;
}

function leerVersion(raiz: string): string | null {
  const archivo = join(raiz, ".faluspec");
  if (!existsSync(archivo)) return null;
  return readFileSync(archivo, "utf8").trim();
}

process.exit(main(process.argv.slice(2)));
