/**
 * Lee el encabezado de un archivo FaLuSpec — especificación §3.6.
 *
 * El encabezado NO es YAML: es un subconjunto declarado. Este parser lo lee y,
 * sobre todo, **rechaza lo que queda afuera**. Si aceptara de más, el formato se
 * volvería YAML de hecho: alcanza con que alguien escriba un valor multilínea y
 * funcione una vez para que nadie pueda volver atrás.
 */

export interface Encabezado {
  /** Campo -> valor, tal cual se escribió. Todo valor es texto. */
  campos: Map<string, string>;
  /** Campo -> línea donde aparece, para poder señalar el problema. */
  lineas: Map<string, number>;
}

export interface ProblemaFormato {
  linea: number;
  mensaje: string;
}

export interface Leido {
  encabezado: Encabezado;
  problemas: ProblemaFormato[];
  /** El resto del archivo, desde después del segundo `---`. */
  cuerpo: string;
}

const CLAVE_VALIDA = /^[a-z][a-z_]*$/;

export function leerEncabezado(texto: string): Leido {
  const campos = new Map<string, string>();
  const lineas = new Map<string, number>();
  const problemas: ProblemaFormato[] = [];
  const filas = texto.split(/\r?\n/);

  if (filas[0]?.trim() !== "---") {
    problemas.push({ linea: 1, mensaje: "el archivo no empieza con un encabezado delimitado por ---" });
    return { encabezado: { campos, lineas }, problemas, cuerpo: texto };
  }

  let cierre = -1;
  for (let i = 1; i < filas.length; i++) {
    const cruda = filas[i] ?? "";
    if (cruda.trim() === "---") {
      cierre = i;
      break;
    }
    const problema = revisarFila(cruda, i + 1, campos, lineas);
    if (problema) problemas.push(problema);
  }

  if (cierre === -1) {
    problemas.push({ linea: filas.length, mensaje: "el encabezado no se cierra con ---" });
    return { encabezado: { campos, lineas }, problemas, cuerpo: "" };
  }

  return {
    encabezado: { campos, lineas },
    problemas,
    cuerpo: filas.slice(cierre + 1).join("\n"),
  };
}

function revisarFila(
  cruda: string,
  numero: number,
  campos: Map<string, string>,
  lineas: Map<string, number>,
): ProblemaFormato | null {
  if (cruda.trim() === "") return null;

  if (/^\s/.test(cruda)) {
    return { linea: numero, mensaje: "el encabezado no admite anidamiento (§3.6)" };
  }
  if (cruda.startsWith("#")) {
    return { linea: numero, mensaje: "el encabezado no admite comentarios (§3.6)" };
  }

  const corte = cruda.indexOf(":");
  if (corte === -1) {
    return { linea: numero, mensaje: `no es un campo \`clave: valor\`: ${cruda}` };
  }

  const clave = cruda.slice(0, corte);
  // El valor es todo lo que sigue hasta el fin de la línea, así que puede
  // contener `:` sin escaparlo. Es la mitad de la razón por la que no es YAML.
  const valor = cruda.slice(corte + 1).trim();

  if (!CLAVE_VALIDA.test(clave)) {
    return { linea: numero, mensaje: `clave inválida \`${clave}\`: minúsculas y guión bajo (§3.6)` };
  }
  if (valor === "|" || valor === ">" || valor.startsWith("|") || valor.startsWith(">")) {
    return { linea: numero, mensaje: "el encabezado no admite valores multilínea (§3.6)" };
  }
  if (campos.has(clave)) {
    return { linea: numero, mensaje: `campo repetido \`${clave}\`` };
  }

  campos.set(clave, valor);
  lineas.set(clave, numero);
  return null;
}

/**
 * `[E4-03, E4-07]` -> ['E4-03', 'E4-07'].
 *
 * Devuelve `null` si el valor no tiene la forma de lista, para que quien llama
 * pueda reportarlo con su propio mensaje. Vacío y `[]` son la misma cosa: no hay
 * ninguno.
 */
export function comoLista(valor: string | undefined): string[] | null {
  if (valor === undefined || valor === "") return [];
  if (!valor.startsWith("[") || !valor.endsWith("]")) return null;
  return valor
    .slice(1, -1)
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x !== "");
}
