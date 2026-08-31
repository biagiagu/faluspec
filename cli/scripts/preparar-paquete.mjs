/**
 * Prepara el paquete antes de empaquetar o publicar.
 *
 * La plantilla vive en la raíz del repo, que es su lugar: se lee y se copia a
 * mano mucho más seguido de lo que se instala el CLI. Pero `faluspec init` la
 * necesita adentro del paquete, así que se copia acá al empaquetar — una sola
 * fuente de verdad, duplicada nada más que en el artefacto.
 */
import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = join(aqui, "..", "..", "plantilla");
const destino = join(aqui, "..", "plantilla");

rmSync(destino, { recursive: true, force: true });
cpSync(origen, destino, { recursive: true });
console.log("plantilla copiada al paquete");
