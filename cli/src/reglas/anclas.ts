/**
 * La regla que hace que este formato valga la pena: cada ancla resuelve — §2.2 regla 4.
 *
 * Un ancla que dejó de resolver significa que el código se movió y la
 * especificación quedó mintiendo. Es el hallazgo más importante que puede dar
 * este validador, y el único que ninguna otra herramienta del nicho puede dar,
 * porque ninguna otra guarda dónde vive cada criterio.
 */
import { resolverAncla } from "../anclas/resolver.js";
import type { Backlog } from "../formato/backlog.js";
import type { Hallazgo } from "./estructura.js";

export interface ResumenAnclas {
  resueltas: number;
  aproximadas: number;
  ninguna: number;
  rotas: number;
}

export function validarAnclas(
  backlog: Backlog,
  raiz: string,
): { hallazgos: Hallazgo[]; resumen: ResumenAnclas } {
  const hallazgos: Hallazgo[] = [];
  const resumen: ResumenAnclas = { resueltas: 0, aproximadas: 0, ninguna: 0, rotas: 0 };

  for (const doc of [...backlog.items.values(), ...backlog.epicas.values()]) {
    for (const criterio of doc.criterios) {
      for (const ancla of criterio.anclas) {
        const { estado, detalle } = resolverAncla(raiz, ancla);
        const base = {
          donde: criterio.id,
          archivo: doc.archivo,
          linea: criterio.linea,
          regla: "§2.2 regla 4",
        };
        switch (estado) {
          case "resuelve":
            resumen.resueltas += 1;
            break;
          case "resuelve-aproximado":
            resumen.aproximadas += 1;
            hallazgos.push({
              ...base,
              gravedad: "aviso",
              mensaje: `ancla \`${ancla}\`: ${detalle}`,
            });
            break;
          case "declarada-ninguna":
            resumen.ninguna += 1;
            break;
          case "sin-motivo":
            hallazgos.push({ ...base, gravedad: "error", regla: "§2.3 ancla", mensaje: detalle });
            break;
          default:
            resumen.rotas += 1;
            hallazgos.push({
              ...base,
              gravedad: "error",
              mensaje: `el ancla no resuelve: ${detalle}`,
            });
        }
      }
    }
  }

  return { hallazgos, resumen };
}
