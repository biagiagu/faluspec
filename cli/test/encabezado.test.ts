import { describe, it, expect } from "vitest";
import { leerEncabezado, comoLista } from "../src/formato/encabezado.js";

const ITEM = `---
id: E4-07
epica: E4
titulo: Reintento de notificaciones fallidas
prioridad: P1
estado: done
fecha_estado: 2026-03-14
depende_de: [E4-03]
hito: H1
---

## Historia

Como responsable de la operación...
`;

describe("leerEncabezado: lo que el formato admite", () => {
  it("lee los campos de un ítem bien formado", () => {
    const { encabezado, problemas } = leerEncabezado(ITEM);
    expect(problemas).toEqual([]);
    expect(encabezado.campos.get("id")).toBe("E4-07");
    expect(encabezado.campos.get("titulo")).toBe("Reintento de notificaciones fallidas");
    expect(encabezado.campos.get("hito")).toBe("H1");
  });

  it("devuelve el cuerpo sin el encabezado", () => {
    const { cuerpo } = leerEncabezado(ITEM);
    expect(cuerpo.trimStart().startsWith("## Historia")).toBe(true);
  });

  it("un valor puede contener dos puntos sin escaparlos", () => {
    const texto = `---
bloqueado_por: falta el dato: nadie lo pidió
---
`;
    const { encabezado, problemas } = leerEncabezado(texto);
    expect(problemas).toEqual([]);
    expect(encabezado.campos.get("bloqueado_por")).toBe("falta el dato: nadie lo pidió");
  });

  it("todo valor es texto: `no` no se convierte en booleano", () => {
    const { encabezado } = leerEncabezado("---\ntitulo: no\n---\n");
    expect(encabezado.campos.get("titulo")).toBe("no");
  });

  it("todo valor es texto: una versión no se convierte en número", () => {
    const { encabezado } = leerEncabezado("---\nversion: 0.10\n---\n");
    expect(encabezado.campos.get("version")).toBe("0.10");
  });

  it("tolera líneas en blanco entre campos", () => {
    const { encabezado, problemas } = leerEncabezado("---\nid: E1-01\n\nestado: todo\n---\n");
    expect(problemas).toEqual([]);
    expect(encabezado.campos.size).toBe(2);
  });

  it("recuerda en qué línea está cada campo", () => {
    const { encabezado } = leerEncabezado(ITEM);
    expect(encabezado.lineas.get("id")).toBe(2);
    expect(encabezado.lineas.get("estado")).toBe(6);
  });
});

describe("leerEncabezado: lo que el formato rechaza", () => {
  it("rechaza el anidamiento", () => {
    const { problemas } = leerEncabezado("---\nid: E1-01\nmeta:\n  autor: alguien\n---\n");
    expect(problemas).toHaveLength(1);
    expect(problemas[0]?.mensaje).toContain("anidamiento");
    expect(problemas[0]?.linea).toBe(4);
  });

  it("rechaza los valores multilínea", () => {
    const { problemas } = leerEncabezado("---\ntitulo: |\n---\n");
    expect(problemas[0]?.mensaje).toContain("multilínea");
  });

  it("rechaza los comentarios", () => {
    const { problemas } = leerEncabezado("---\n# esto es un ítem\nid: E1-01\n---\n");
    expect(problemas[0]?.mensaje).toContain("comentarios");
  });

  it("rechaza una clave en mayúsculas", () => {
    const { problemas } = leerEncabezado("---\nID: E1-01\n---\n");
    expect(problemas[0]?.mensaje).toContain("clave inválida");
  });

  it("rechaza un campo repetido en vez de quedarse con el último", () => {
    const { problemas, encabezado } = leerEncabezado("---\nestado: todo\nestado: done\n---\n");
    expect(problemas[0]?.mensaje).toContain("repetido");
    expect(encabezado.campos.get("estado")).toBe("todo");
  });

  it("rechaza una línea que no es clave: valor", () => {
    const { problemas } = leerEncabezado("---\nid E1-01\n---\n");
    expect(problemas[0]?.mensaje).toContain("clave: valor");
  });

  it("avisa cuando el archivo no empieza con encabezado", () => {
    const { problemas } = leerEncabezado("# Un ítem\n\nsin encabezado\n");
    expect(problemas[0]?.mensaje).toContain("no empieza");
  });

  it("avisa cuando el encabezado no se cierra", () => {
    const { problemas } = leerEncabezado("---\nid: E1-01\n\n## Historia\n");
    expect(problemas.at(-1)?.mensaje).toContain("no se cierra");
  });
});

describe("comoLista", () => {
  it("lee una lista con corchetes", () => {
    expect(comoLista("[E4-03, E4-07]")).toEqual(["E4-03", "E4-07"]);
  });

  it("una lista vacía y un campo ausente son lo mismo", () => {
    expect(comoLista("[]")).toEqual([]);
    expect(comoLista(undefined)).toEqual([]);
    expect(comoLista("")).toEqual([]);
  });

  it("devuelve null si no tiene forma de lista, para que quien llama lo reporte", () => {
    expect(comoLista("E4-03")).toBeNull();
  });
});
