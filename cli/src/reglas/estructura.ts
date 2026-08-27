/**
 * Las reglas que se comprueban leyendo sólo el backlog — especificación §2.2 y §3.3.
 *
 * Las que necesitan abrir el código del proyecto (que cada ancla resuelva) viven
 * aparte: son las caras, y son las que hacen que este CLI sea específico por
 * lenguaje.
 *
 * Una regla acá **no arregla nada**. Devuelve hallazgos.
 */
import {
  ID_CRITERIO,
  ID_CRITERIO_EPICA,
  ID_ITEM,
  tipoDeVerificacion,
  type Backlog,
  type Documento,
} from "../formato/backlog.js";

export type Gravedad = "error" | "aviso";

export interface Hallazgo {
  gravedad: Gravedad;
  /** Identificador del ítem, épica o criterio afectado. */
  donde: string;
  archivo: string;
  linea?: number;
  regla: string;
  mensaje: string;
}

const ESTADOS = new Set(["todo", "wip", "done", "blocked"]);
const TIPOS_VERIFICACION = new Set(["unit", "integracion", "e2e", "estatica", "manual"]);
const OBLIGATORIOS = ["id", "epica", "titulo", "prioridad", "estado"];

export function validarEstructura(backlog: Backlog): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  const vistos = new Map<string, string>();

  for (const doc of [...backlog.epicas.values(), ...backlog.items.values()]) {
    for (const p of doc.problemasFormato) {
      hallazgos.push({
        gravedad: "error",
        donde: doc.id || doc.archivo,
        archivo: doc.archivo,
        linea: p.linea,
        regla: "§3.6 encabezado",
        mensaje: p.mensaje,
      });
    }
  }

  for (const { archivo, motivo } of backlog.descartados) {
    hallazgos.push({
      gravedad: "error",
      donde: archivo,
      archivo,
      regla: "§6 identificadores",
      mensaje: `archivo ignorado: ${motivo}`,
    });
  }

  for (const item of ordenados(backlog.items)) {
    hallazgos.push(...validarItem(item, backlog, vistos));
  }
  for (const epica of ordenados(backlog.epicas)) {
    hallazgos.push(...validarCriteriosDeEpica(epica, vistos));
  }
  hallazgos.push(...detectarCiclos(backlog));
  return hallazgos;
}

function ordenados(docs: Map<string, Documento>): Documento[] {
  return [...docs.values()].sort((a, b) => comparar(a.id, b.id));
}

/** Orden numérico, nunca alfabético: E4-07 antes que E19-01. */
export function comparar(a: string, b: string): number {
  const n = (s: string): number[] => (s.match(/\d+/g) ?? []).map(Number);
  const [na, nb] = [n(a), n(b)];
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    const d = (na[i] ?? -1) - (nb[i] ?? -1);
    if (d !== 0) return d;
  }
  return a.localeCompare(b);
}

function validarItem(item: Documento, backlog: Backlog, vistos: Map<string, string>): Hallazgo[] {
  const out: Hallazgo[] = [];
  const de = (regla: string, mensaje: string, gravedad: Gravedad = "error"): Hallazgo => ({
    gravedad,
    donde: item.id,
    archivo: item.archivo,
    regla,
    mensaje,
  });

  for (const campo of OBLIGATORIOS) {
    if (!item.campos.get(campo)) out.push(de("§3.2 campos", `falta el campo obligatorio \`${campo}\``));
  }

  if (!ID_ITEM.test(item.id)) {
    out.push(de("§6 identificadores", `\`${item.id}\` no respeta la gramática E<n>-<nn>`));
  }
  const duplicado = vistos.get(item.id);
  if (duplicado) out.push(de("§6 identificadores", `identificador repetido, ya está en ${duplicado}`));
  vistos.set(item.id, item.archivo);

  const epica = item.campos.get("epica") ?? "";
  if (epica && !backlog.epicas.has(epica)) {
    out.push(de("§3.2 campos", `la épica \`${epica}\` no existe`));
  }
  if (epica && !item.id.startsWith(epica + "-")) {
    out.push(de("§3.2 campos", `\`epica: ${epica}\` no coincide con el prefijo del id`));
  }

  const estado = item.campos.get("estado") ?? "";
  if (estado && !ESTADOS.has(estado)) {
    out.push(de("§7 estados", `estado desconocido \`${estado}\``));
  }

  if ((estado === "done" || estado === "blocked") && !item.campos.get("fecha_estado")) {
    out.push(de("§3.3 regla 3", `un ítem \`${estado}\` necesita \`fecha_estado\``));
  }

  if (estado === "blocked") {
    const propio = item.campos.get("bloqueado_por");
    const heredado = backlog.epicas.get(epica)?.campos.get("bloqueado_por");
    if (!propio && !heredado) {
      out.push(de("§3.3 regla 6", "un ítem `blocked` declara `bloqueado_por`, propio o de su épica"));
    } else if (propio && propio.length > 120) {
      out.push(
        de(
          "§3.2 campos",
          `\`bloqueado_por\` tiene ${propio.length} caracteres: es una línea corta, el detalle va al historial`,
          "aviso",
        ),
      );
    }
  }

  if (estado === "done") {
    if (!/^##\s+Impacto\s*$/m.test(item.cuerpo)) {
      out.push(de("§3.5 impacto", "un ítem `done` declara su impacto, aunque sea «ninguno»"));
    }
    if (item.criterios.length === 0) {
      out.push(de("§3.3 regla 4", "un ítem `done` tiene al menos un criterio"));
    }
  }

  for (const dep of listaDeDependencias(item, out, de)) {
    const otro = backlog.items.get(dep);
    if (!otro) {
      out.push(de("§3.3 regla 1", `\`depende_de\` apunta a \`${dep}\`, que no existe`));
      continue;
    }
    if (estado === "done" && otro.campos.get("estado") !== "done") {
      out.push(de("§3.3 regla 5", `está \`done\` pero depende de \`${dep}\`, que no lo está`));
    }
  }

  out.push(...validarCriterios(item, estado === "done", vistos));
  return out;
}

function listaDeDependencias(
  item: Documento,
  out: Hallazgo[],
  de: (r: string, m: string, g?: Gravedad) => Hallazgo,
): string[] {
  const crudo = item.campos.get("depende_de");
  if (crudo === undefined || crudo === "") return [];
  if (!crudo.startsWith("[") || !crudo.endsWith("]")) {
    out.push(de("§3.6 encabezado", "`depende_de` es una lista entre corchetes"));
    return [];
  }
  return crudo
    .slice(1, -1)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function validarCriterios(doc: Documento, cerrado: boolean, vistos: Map<string, string>): Hallazgo[] {
  const out: Hallazgo[] = [];
  for (const c of doc.criterios) {
    const de = (regla: string, mensaje: string, gravedad: Gravedad = "error"): Hallazgo => ({
      gravedad,
      donde: c.id,
      archivo: doc.archivo,
      linea: c.linea,
      regla,
      mensaje,
    });

    if (!ID_CRITERIO.test(c.id) && !ID_CRITERIO_EPICA.test(c.id)) {
      out.push(de("§6 identificadores", `\`${c.id}\` no respeta la gramática de criterio`));
    } else if (!c.id.startsWith(doc.id)) {
      out.push(de("§6 identificadores", `el criterio no pertenece a \`${doc.id}\``));
    }

    const duplicado = vistos.get(c.id);
    if (duplicado) out.push(de("§2.2 regla 1", `identificador repetido, ya está en ${duplicado}`));
    vistos.set(c.id, doc.archivo);

    const tipo = tipoDeVerificacion(c.verifica);
    if (tipo && !TIPOS_VERIFICACION.has(tipo)) {
      out.push(de("§2.4 verificación", `tipo de verificación desconocido \`${tipo}\``));
    }

    for (const ancla of c.anclas) {
      if (ancla.startsWith("ninguna") && !/ninguna\s+—\s+\S/.test(ancla)) {
        out.push(de("§2.3 ancla", "`ancla: ninguna` lleva motivo: sin él no se distingue de un olvido"));
      }
    }

    if (cerrado) {
      if (c.anclas.length === 0) out.push(de("§2.2 regla 3", "un criterio de un ítem `done` declara ancla"));
      if (!tipo) out.push(de("§2.2 regla 3", "un criterio de un ítem `done` declara verificación"));
      if (tipo && tipo !== "manual" && !(c.verifica ?? "").includes("→")) {
        out.push(de("§2.4 verificación", `\`${tipo}\` debería nombrar el test concreto`, "aviso"));
      }
    }
  }
  return out;
}

function validarCriteriosDeEpica(epica: Documento, vistos: Map<string, string>): Hallazgo[] {
  // Una épica no tiene estado propio (§4), así que sus criterios nunca disparan
  // la exigencia de ancla: es la decisión abierta §9.6, y hasta que se cierre lo
  // único que se comprueba es que el identificador sea único y bien formado.
  return validarCriterios(epica, false, vistos);
}

function detectarCiclos(backlog: Backlog): Hallazgo[] {
  const out: Hallazgo[] = [];
  const estado = new Map<string, "abierto" | "cerrado">();

  const visitar = (id: string, camino: string[]): void => {
    if (estado.get(id) === "cerrado") return;
    if (estado.get(id) === "abierto") {
      const item = backlog.items.get(id);
      out.push({
        gravedad: "error",
        donde: id,
        archivo: item?.archivo ?? "",
        regla: "§3.3 regla 2",
        mensaje: `ciclo de dependencias: ${[...camino.slice(camino.indexOf(id)), id].join(" → ")}`,
      });
      return;
    }
    estado.set(id, "abierto");
    const crudo = backlog.items.get(id)?.campos.get("depende_de") ?? "";
    for (const dep of crudo.replace(/[[\]]/g, "").split(",").map((x) => x.trim()).filter(Boolean)) {
      if (backlog.items.has(dep)) visitar(dep, [...camino, id]);
    }
    estado.set(id, "cerrado");
  };

  for (const id of [...backlog.items.keys()].sort(comparar)) visitar(id, []);
  return out;
}
