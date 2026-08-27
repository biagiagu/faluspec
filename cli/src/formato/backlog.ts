/**
 * Lee un directorio de backlog: épicas, ítems y los criterios de cada uno.
 *
 * Sólo lee. No juzga: las reglas viven en `reglas/`. La separación es la misma
 * que entre los agentes que escriben y el que audita, y por el mismo motivo —
 * quien lee no tiene que tener opinión sobre lo que encuentra.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { leerEncabezado, type ProblemaFormato } from "./encabezado.js";

export const ID_EPICA = /^E(\d+)$/;
export const ID_ITEM = /^E(\d+)-(\d{2})$/;
export const ID_CRITERIO = /^E(\d+)-(\d{2})\.(\d+)$/;
/** Un criterio de épica: `E19.a`. Ver decisión abierta §9.6. */
export const ID_CRITERIO_EPICA = /^E(\d+)\.([a-z])$/;

export interface Criterio {
  id: string;
  titulo: string;
  /** Línea del `###` que lo abre, dentro del archivo. */
  linea: number;
  anclas: string[];
  verifica: string | null;
  escenario: string;
}

export interface Documento {
  id: string;
  archivo: string;
  campos: Map<string, string>;
  lineas: Map<string, number>;
  criterios: Criterio[];
  cuerpo: string;
  problemasFormato: ProblemaFormato[];
}

export interface Backlog {
  epicas: Map<string, Documento>;
  items: Map<string, Documento>;
  /** Archivos que no se pudieron clasificar, con su motivo. */
  descartados: { archivo: string; motivo: string }[];
}

export function leerBacklog(directorio: string): Backlog {
  const epicas = new Map<string, Documento>();
  const items = new Map<string, Documento>();
  const descartados: { archivo: string; motivo: string }[] = [];

  for (const nombre of readdirSync(directorio).sort()) {
    if (!nombre.endsWith(".md")) continue;
    // Los formularios de la plantilla y el README no son contenido del backlog.
    if (nombre.startsWith("_") || nombre === "README.md") continue;

    const doc = leerDocumento(join(directorio, nombre), nombre);
    if (doc.id === "") {
      descartados.push({ archivo: nombre, motivo: "no declara `id`" });
      continue;
    }
    if (ID_ITEM.test(doc.id)) items.set(doc.id, doc);
    else if (ID_EPICA.test(doc.id)) epicas.set(doc.id, doc);
    else descartados.push({ archivo: nombre, motivo: `\`${doc.id}\` no es un identificador válido` });
  }

  return { epicas, items, descartados };
}

function leerDocumento(ruta: string, archivo: string): Documento {
  const texto = readFileSync(ruta, "utf8");
  const { encabezado, problemas, cuerpo } = leerEncabezado(texto);
  const desplazamiento = texto.split(/\r?\n/).length - cuerpo.split(/\r?\n/).length;
  return {
    id: encabezado.campos.get("id") ?? "",
    archivo,
    campos: encabezado.campos,
    lineas: encabezado.lineas,
    criterios: leerCriterios(cuerpo, desplazamiento),
    cuerpo,
    problemasFormato: problemas,
  };
}

const ENCABEZADO_CRITERIO = /^###\s+(\S+)\s+—\s+(.+?)\s*$/;
const CAMPO_CRITERIO = /^-\s+(anchor|verify):\s*(.+?)\s*$/;

export function leerCriterios(cuerpo: string, desplazamiento = 0): Criterio[] {
  const criterios: Criterio[] = [];
  const filas = cuerpo.split(/\r?\n/);
  let actual: Criterio | null = null;
  let escenario: string[] = [];

  const cerrar = (): void => {
    if (actual) {
      actual.escenario = escenario.join(" ").trim();
      criterios.push(actual);
    }
  };

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i] ?? "";
    const abre = ENCABEZADO_CRITERIO.exec(fila);
    if (abre) {
      cerrar();
      escenario = [];
      actual = {
        id: abre[1] ?? "",
        titulo: abre[2] ?? "",
        linea: i + 1 + desplazamiento,
        anclas: [],
        verifica: null,
        escenario: "",
      };
      continue;
    }
    if (!actual) continue;
    // Otro encabezado de nivel 2 corta el criterio: `## Impact`, `## History`.
    if (fila.startsWith("## ")) {
      cerrar();
      actual = null;
      continue;
    }
    const campo = CAMPO_CRITERIO.exec(fila);
    if (campo) {
      if (campo[1] === "anchor") actual.anclas.push(limpiar(campo[2] ?? ""));
      else actual.verifica = limpiar(campo[2] ?? "");
      continue;
    }
    if (fila.trim() !== "") escenario.push(fila.trim());
  }
  cerrar();
  return criterios;
}

/** Saca los backticks y el énfasis de markdown, que son presentación. */
function limpiar(valor: string): string {
  return valor.replace(/`/g, "").replace(/\*\*/g, "").trim();
}

/** El tipo declarado en `verifica`, sin el test: `unit → x.test.ts::y` -> `unit`. */
export function tipoDeVerificacion(verifica: string | null): string | null {
  if (!verifica) return null;
  const [tipo] = verifica.split("→");
  return (tipo ?? "").trim() || null;
}
