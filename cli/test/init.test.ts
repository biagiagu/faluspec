import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { init } from "../src/init.js";

let destino: string;

beforeEach(() => {
  destino = mkdtempSync(join(tmpdir(), "faluspec-init-"));
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});
afterEach(() => {
  vi.restoreAllMocks();
  rmSync(destino, { recursive: true, force: true });
});

describe("init deja el proyecto listo para escribir el primer ítem", () => {
  it("crea lo que la plantilla trae", () => {
    expect(init(destino)).toBe(0);
    for (const archivo of [
      "backlog/README.md",
      "backlog/_plantilla-item.md",
      "docs/CONSTITUCION.md",
      "docs/PLAN.md",
      ".claude/agents/verificador.md",
      ".faluspec",
      ".gitattributes",
    ]) {
      expect(existsSync(join(destino, archivo)), archivo).toBe(true);
    }
  });

  it("el README de la plantilla no va a la raíz, donde el proyecto ya tiene el suyo", () => {
    init(destino);
    expect(existsSync(join(destino, "docs/ARRANQUE-FALUSPEC.md"))).toBe(true);
    expect(existsSync(join(destino, "README.md"))).toBe(false);
  });

  it("deja un `.faluspec` con la versión del formato", () => {
    init(destino);
    expect(readFileSync(join(destino, ".faluspec"), "utf8").trim()).toMatch(/^\d+\.\d+$/);
  });
});

describe("init no pisa nada", () => {
  it("respeta un archivo que ya existe", () => {
    mkdirSync(join(destino, "docs"), { recursive: true });
    writeFileSync(join(destino, "docs", "CONSTITUCION.md"), "MI CONSTITUCIÓN", "utf8");

    init(destino);

    expect(readFileSync(join(destino, "docs", "CONSTITUCION.md"), "utf8")).toBe("MI CONSTITUCIÓN");
  });

  it("respeta el README del proyecto", () => {
    writeFileSync(join(destino, "README.md"), "MI PROYECTO", "utf8");
    init(destino);
    expect(readFileSync(join(destino, "README.md"), "utf8")).toBe("MI PROYECTO");
  });

  it("correrlo dos veces no rompe nada", () => {
    init(destino);
    const antes = readFileSync(join(destino, "docs", "PLAN.md"), "utf8");
    expect(init(destino)).toBe(0);
    expect(readFileSync(join(destino, "docs", "PLAN.md"), "utf8")).toBe(antes);
  });
});
