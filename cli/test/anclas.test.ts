import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolverAncla } from "../src/anclas/resolver.js";

let raiz: string;

beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), "faluspec-anclas-"));
  mkdirSync(join(raiz, "src"), { recursive: true });
  mkdirSync(join(raiz, "public"), { recursive: true });
  writeFileSync(
    join(raiz, "src", "modulo.ts"),
    [
      "const PRIVADA = 'no exportada';",
      "export function calcularEspera(intento: number): number {",
      "  return intento * 2;",
      "}",
      "export class Cola {",
      "  restaurarPendientes(): void {}",
      "}",
      "export const esquema = z.object({",
      "  GOOGLE_HD: z.string(),",
      "  API_PORT: z.number(),",
      "});",
    ].join("\n"),
    "utf8",
  );
  writeFileSync(join(raiz, "public", "icono.png"), "binario", "utf8");
  writeFileSync(join(raiz, "notas.md"), "# Notas\n", "utf8");
  writeFileSync(join(raiz, "script.py"), "def calcular_espera(n):\n    return n * 2\n", "utf8");
});

afterEach(() => {
  rmSync(raiz, { recursive: true, force: true });
});

describe("anclas a símbolo, que es la razón de ser del formato", () => {
  it("resuelve una función", () => {
    expect(resolverAncla(raiz, "src/modulo.ts#calcularEspera").estado).toBe("resuelve");
  });

  it("resuelve una clase", () => {
    expect(resolverAncla(raiz, "src/modulo.ts#Cola").estado).toBe("resuelve");
  });

  it("resuelve un símbolo NO exportado", () => {
    // §2.3: lo que hay que parametrizar suele ser una constante privada del módulo.
    expect(resolverAncla(raiz, "src/modulo.ts#PRIVADA").estado).toBe("resuelve");
  });

  it("no resuelve un símbolo que no existe", () => {
    const r = resolverAncla(raiz, "src/modulo.ts#noExiste");
    expect(r.estado).toBe("no-resuelve");
    expect(r.detalle).toContain("noExiste");
  });

  it("no resuelve si el archivo no existe", () => {
    expect(resolverAncla(raiz, "src/fantasma.ts#algo").estado).toBe("no-resuelve");
  });
});

describe("un nivel de propiedad", () => {
  it("resuelve una clave dentro de un objeto envuelto en una llamada", () => {
    // `const esquema = z.object({ GOOGLE_HD: ... })` es la forma normal, no un caso raro.
    expect(resolverAncla(raiz, "src/modulo.ts#esquema.GOOGLE_HD").estado).toBe("resuelve");
  });

  it("no resuelve una clave que no está", () => {
    const r = resolverAncla(raiz, "src/modulo.ts#esquema.NO_ESTA");
    expect(r.estado).toBe("no-resuelve");
    expect(r.detalle).toContain("NO_ESTA");
  });

  it("resuelve un miembro de clase", () => {
    expect(resolverAncla(raiz, "src/modulo.ts#Cola.restaurarPendientes").estado).toBe("resuelve");
  });
});

describe("las otras formas de ancla", () => {
  it("un archivo sin símbolos posibles resuelve entero", () => {
    expect(resolverAncla(raiz, "public/icono.png").estado).toBe("resuelve");
    expect(resolverAncla(raiz, "notas.md").estado).toBe("resuelve");
  });

  it("un archivo con símbolos exige nombrar uno", () => {
    const r = resolverAncla(raiz, "src/modulo.ts");
    expect(r.estado).toBe("malformada");
    expect(r.detalle).toContain("hay que nombrar uno");
  });

  it("un directorio resuelve con la barra final", () => {
    expect(resolverAncla(raiz, "public/").estado).toBe("resuelve");
  });

  it("sin la barra final, un directorio no resuelve", () => {
    // Le pasó al primer backlog real escrito a mano: `apps/web/public`.
    expect(resolverAncla(raiz, "public").estado).toBe("no-resuelve");
  });

  it("`none` con motivo es válida", () => {
    const r = resolverAncla(raiz, "none — el estado vive fuera del repositorio");
    expect(r.estado).toBe("declarada-ninguna");
    expect(r.detalle).toBe("el estado vive fuera del repositorio");
  });

  it("`none` sin motivo no se distingue de un olvido", () => {
    expect(resolverAncla(raiz, "none").estado).toBe("sin-motivo");
  });
});

describe("lenguajes que este CLI no sabe parsear", () => {
  it("cae a coincidencia textual y lo declara", () => {
    const r = resolverAncla(raiz, "script.py#calcular_espera");
    expect(r.estado).toBe("resuelve-aproximado");
    expect(r.detalle).toContain("textual");
  });

  it("aun aproximando, avisa cuando el nombre no está", () => {
    expect(resolverAncla(raiz, "script.py#no_existe").estado).toBe("no-resuelve");
  });
});
