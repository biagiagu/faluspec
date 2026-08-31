/**
 * `faluspec init` — deja la plantilla en un proyecto.
 *
 * Es el paso que hasta ahora se hacía copiando directorios a mano, con la
 * lista de destinos escrita en el README de la plantilla. Automatizarlo tiene
 * una sola regla: **no pisar nada**. Un proyecto que ya existe es el caso
 * normal, no la excepción, y perder el README de alguien por instalar una
 * herramienta es imperdonable.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Dónde quedó la plantilla: dentro del paquete instalado, o en el repo si corre desde el fuente. */
function directorioPlantilla(): string {
  const aqui = dirname(fileURLToPath(import.meta.url));
  for (const candidato of [join(aqui, "..", "plantilla"), join(aqui, "..", "..", "plantilla")]) {
    if (existsSync(candidato)) return candidato;
  }
  throw new Error("no encuentro la plantilla dentro del paquete");
}

/** Destino de cada pieza. El README de la plantilla no va a la raíz: ahí ya hay uno. */
const DESTINOS: [string, string][] = [
  ["backlog", "backlog"],
  ["docs/CONSTITUCION.md", "docs/CONSTITUCION.md"],
  ["docs/PLAN.md", "docs/PLAN.md"],
  ["docs/decisiones", "docs/decisiones"],
  [".claude/agents", ".claude/agents"],
  [".faluspec", ".faluspec"],
  [".gitattributes", ".gitattributes"],
  ["README.md", "docs/ARRANQUE-FALUSPEC.md"],
];

export function init(destinoRaiz: string): number {
  const plantilla = directorioPlantilla();
  const raiz = resolve(destinoRaiz);
  const escritos: string[] = [];
  const salteados: string[] = [];

  for (const [desde, hacia] of DESTINOS) {
    const origen = join(plantilla, desde);
    if (!existsSync(origen)) continue;
    copiarSinPisar(origen, join(raiz, hacia), raiz, escritos, salteados);
  }

  for (const archivo of escritos) process.stdout.write(`  creado   ${archivo}\n`);
  for (const archivo of salteados) process.stdout.write(`  ya está  ${archivo}\n`);

  if (escritos.length === 0) {
    process.stdout.write("\nNo había nada que crear: el proyecto ya tiene la plantilla.\n");
    return 0;
  }

  process.stdout.write(
    "\nListo. Ahora, en este orden:\n" +
      "  1. Completá docs/CONSTITUCION.md — es lo único obligatorio antes del primer ítem.\n" +
      "  2. Escribí un hito en docs/PLAN.md, definido por lo que significa para una persona.\n" +
      "  3. Escribí tu primera épica y tu primer ítem en backlog/, copiando los formularios `_`.\n" +
      "  4. Borrá los archivos que empiezan con `_` cuando ya no los necesites.\n" +
      "\nDespués, `faluspec validate .` te dice si el backlog se sostiene.\n" +
      (salteados.length > 0
        ? "\nLo que ya existía no se tocó. Si querés la versión de la plantilla, mirala en\n" +
          "docs/ARRANQUE-FALUSPEC.md o en el repositorio.\n"
        : ""),
  );
  return 0;
}

function copiarSinPisar(
  origen: string,
  destino: string,
  raiz: string,
  escritos: string[],
  salteados: string[],
): void {
  if (statSync(origen).isDirectory()) {
    mkdirSync(destino, { recursive: true });
    for (const nombre of readdirSync(origen)) {
      copiarSinPisar(join(origen, nombre), join(destino, nombre), raiz, escritos, salteados);
    }
    return;
  }
  const relativo = relative(raiz, destino).replace(/\\/g, "/");
  if (existsSync(destino)) {
    salteados.push(relativo);
    return;
  }
  mkdirSync(dirname(destino), { recursive: true });
  copyFileSync(origen, destino);
  escritos.push(relativo);
}


