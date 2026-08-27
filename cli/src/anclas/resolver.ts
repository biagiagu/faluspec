/**
 * Resuelve un ancla contra el código del proyecto — especificación §2.3.
 *
 * Ésta es la parte que justifica todo el formato: un ancla que apunta a un
 * símbolo se puede comprobar mecánicamente, y por eso el ancla nunca apunta a un
 * número de línea. Es también la parte específica por lenguaje, y la que ata este
 * CLI a TypeScript (decisión 002).
 *
 * Para TS/JS la resolución es **exacta**: se parsea el archivo y se buscan sus
 * declaraciones. Para cualquier otro lenguaje es **aproximada**: se busca el
 * nombre como palabra en el texto. La diferencia se reporta, no se disimula —
 * prometer una resolución que no se tiene sería la clase de mentira que este
 * formato existe para evitar.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import ts from "typescript";

export type Estado =
  | "resuelve"
  | "resuelve-aproximado"
  | "no-resuelve"
  | "declarada-ninguna"
  | "sin-motivo"
  | "malformada";

export interface Resolucion {
  estado: Estado;
  detalle: string;
}

const EXTENSIONES_TS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);

export function resolverAncla(raiz: string, ancla: string): Resolucion {
  const texto = ancla.trim();

  if (texto.startsWith("ninguna")) {
    return /^ninguna\s+—\s+\S/.test(texto)
      ? { estado: "declarada-ninguna", detalle: texto.replace(/^ninguna\s+—\s*/, "") }
      : { estado: "sin-motivo", detalle: "`ninguna` lleva motivo" };
  }

  if (texto === "") return { estado: "malformada", detalle: "ancla vacía" };

  const [rutaCruda = "", simbolo] = partir(texto);
  const ruta = join(raiz, rutaCruda);

  if (rutaCruda.endsWith("/")) {
    if (!existsSync(ruta) || !statSync(ruta).isDirectory()) {
      return { estado: "no-resuelve", detalle: `el directorio ${rutaCruda} no existe` };
    }
    return { estado: "resuelve", detalle: "directorio" };
  }

  if (!existsSync(ruta) || !statSync(ruta).isFile()) {
    return { estado: "no-resuelve", detalle: `el archivo ${rutaCruda} no existe` };
  }

  if (simbolo === undefined) {
    // Ancla a archivo entero: vale sólo si no hay símbolo posible (§2.3).
    if (EXTENSIONES_TS.has(extname(ruta)) && simbolosDe(ruta).size > 0) {
      return {
        estado: "malformada",
        detalle: `${rutaCruda} tiene símbolos: hay que nombrar uno`,
      };
    }
    return { estado: "resuelve", detalle: "archivo" };
  }

  const [base = "", propiedad] = simbolo.split(".");

  if (!EXTENSIONES_TS.has(extname(ruta))) {
    const contenido = readFileSync(ruta, "utf8");
    const encontrado = new RegExp(`\\b${escapar(propiedad ?? base)}\\b`).test(contenido);
    return encontrado
      ? { estado: "resuelve-aproximado", detalle: "coincidencia textual: no es un lenguaje que sepa parsear" }
      : { estado: "no-resuelve", detalle: `no encuentro \`${simbolo}\` en ${rutaCruda}` };
  }

  const simbolos = simbolosDe(ruta);
  const miembros = simbolos.get(base);
  if (miembros === undefined) {
    return { estado: "no-resuelve", detalle: `\`${base}\` no está declarado en ${rutaCruda}` };
  }
  if (propiedad !== undefined && !miembros.has(propiedad)) {
    return { estado: "no-resuelve", detalle: `\`${base}\` no tiene \`${propiedad}\`` };
  }
  return { estado: "resuelve", detalle: propiedad === undefined ? "símbolo" : "símbolo y propiedad" };
}

/** Parte `ruta#simbolo` en sus dos mitades. Sin `#`, el símbolo es undefined. */
function partir(ancla: string): [string, string | undefined] {
  const i = ancla.indexOf("#");
  return i === -1 ? [ancla, undefined] : [ancla.slice(0, i), ancla.slice(i + 1)];
}

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const cache = new Map<string, Map<string, Set<string>>>();

/**
 * Declaraciones de nivel superior del archivo, con sus miembros de primer nivel.
 *
 * No hace falta un `Program` de TypeScript ni el `tsconfig` del proyecto ajeno:
 * alcanza con parsear el archivo suelto, y así el validador no depende de que el
 * proyecto compile. Un ancla tiene que poder comprobarse aunque el código esté
 * roto — de hecho es cuando más importa.
 *
 * **Los símbolos no exportados cuentan** (§2.3): lo que hay que parametrizar
 * suele ser una constante privada del módulo.
 */
function simbolosDe(ruta: string): Map<string, Set<string>> {
  const enCache = cache.get(ruta);
  if (enCache) return enCache;

  const fuente = ts.createSourceFile(
    ruta,
    readFileSync(ruta, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const simbolos = new Map<string, Set<string>>();

  for (const nodo of fuente.statements) {
    if (
      (ts.isFunctionDeclaration(nodo) ||
        ts.isClassDeclaration(nodo) ||
        ts.isInterfaceDeclaration(nodo) ||
        ts.isEnumDeclaration(nodo) ||
        ts.isModuleDeclaration(nodo) ||
        ts.isTypeAliasDeclaration(nodo)) &&
      nodo.name !== undefined
    ) {
      simbolos.set(nodo.name.getText(fuente), miembrosDe(nodo, fuente));
      continue;
    }
    if (ts.isVariableStatement(nodo)) {
      for (const decl of nodo.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          simbolos.set(decl.name.text, miembrosDe(decl, fuente));
        }
      }
    }
  }

  cache.set(ruta, simbolos);
  return simbolos;
}

/**
 * Nombres alcanzables con un nivel de punto: propiedades de un objeto literal,
 * miembros de una clase o interfaz.
 *
 * Busca en profundidad dentro del inicializador porque el objeto suele estar
 * envuelto en una llamada — `const esquema = z.object({ CLAVE: ... })` es la
 * forma normal, no un caso raro.
 */
function miembrosDe(nodo: ts.Node, fuente: ts.SourceFile): Set<string> {
  const nombres = new Set<string>();

  if (ts.isClassDeclaration(nodo) || ts.isInterfaceDeclaration(nodo)) {
    for (const m of nodo.members) {
      if (m.name !== undefined) nombres.add(m.name.getText(fuente));
    }
    return nombres;
  }
  if (ts.isEnumDeclaration(nodo)) {
    for (const m of nodo.members) nombres.add(m.name.getText(fuente));
    return nombres;
  }

  const recorrer = (n: ts.Node): void => {
    if (ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) {
      nombres.add(n.name.getText(fuente));
    }
    if (ts.isPropertySignature(n) && n.name !== undefined) {
      nombres.add(n.name.getText(fuente));
    }
    ts.forEachChild(n, recorrer);
  };
  ts.forEachChild(nodo, recorrer);
  return nombres;
}
