import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { leerBacklog } from "../src/formato/backlog.js";
import { validarEstructura, comparar } from "../src/reglas/estructura.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "faluspec-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function escribir(nombre: string, contenido: string): void {
  writeFileSync(join(dir, nombre), contenido, "utf8");
}

function epica(id: string, extra = ""): void {
  escribir(`${id}.md`, `---\nid: ${id}\ntitle: Una épica\n${extra}---\n\n## Qué agrupa\n\nAlgo.\n`);
}

interface Opciones {
  status?: string;
  fecha?: string;
  depende?: string;
  bloqueado?: string;
  criterios?: string;
  impacto?: boolean;
}

function item(id: string, o: Opciones = {}): void {
  const epicaId = id.split("-")[0];
  const cab = [
    "---",
    `id: ${id}`,
    `epic: ${epicaId}`,
    "title: Un ítem",
    "priority: P1",
    `status: ${o.status ?? "todo"}`,
  ];
  if (o.fecha) cab.push(`status_since: ${o.fecha}`);
  if (o.bloqueado) cab.push(`blocked_by: ${o.bloqueado}`);
  if (o.depende) cab.push(`depends_on: ${o.depende}`);
  cab.push("---");
  const criterios = o.criterios ?? "";
  const impacto = o.impacto ? "\n## Impact\n\nNinguno.\n" : "";
  escribir(`${id}.md`, `${cab.join("\n")}\n\n## Story\n\nComo alguien...\n\n## Criteria\n${criterios}${impacto}`);
}

const CRITERIO_COMPLETO = `
### E1-01.1 — Algo verificable

**Dado** una condición, **cuando** pasa algo, **entonces** se observa el resultado.

- anchor: \`src/cosa.ts#hacerAlgo\`
- verify: \`unit\` → \`cosa.test.ts::hace algo\`
`;

function hallazgos(): ReturnType<typeof validarEstructura> {
  return validarEstructura(leerBacklog(dir));
}

describe("un backlog bien formado no produce hallazgos", () => {
  it("con un ítem abierto y otro cerrado", () => {
    epica("E1");
    item("E1-01", {
      status: "done",
      fecha: "2026-01-02",
      criterios: CRITERIO_COMPLETO,
      impacto: true,
    });
    item("E1-02", { depende: "[E1-01]" });
    expect(hallazgos()).toEqual([]);
  });
});

describe("reglas del ítem", () => {
  it("un ítem `done` sin impacto declarado es un error", () => {
    epica("E1");
    item("E1-01", { status: "done", fecha: "2026-01-02", criterios: CRITERIO_COMPLETO });
    expect(hallazgos().map((h) => h.regla)).toContain("§3.5 impacto");
  });

  it("un ítem `done` sin status_since es un error", () => {
    epica("E1");
    item("E1-01", { status: "done", criterios: CRITERIO_COMPLETO, impacto: true });
    expect(hallazgos().some((h) => h.mensaje.includes("status_since"))).toBe(true);
  });

  it("un ítem `done` no puede depender de uno que no lo está", () => {
    epica("E1");
    item("E1-01", { status: "todo" });
    item("E1-02", {
      status: "done",
      fecha: "2026-01-02",
      depende: "[E1-01]",
      criterios: CRITERIO_COMPLETO.replace("E1-01.1", "E1-02.1"),
      impacto: true,
    });
    expect(hallazgos().some((h) => h.regla === "§3.3 regla 5")).toBe(true);
  });

  it("una dependencia inexistente es un error", () => {
    epica("E1");
    item("E1-01", { depende: "[E1-99]" });
    expect(hallazgos().some((h) => h.mensaje.includes("E1-99"))).toBe(true);
  });

  it("detecta un ciclo de dependencias", () => {
    epica("E1");
    item("E1-01", { depende: "[E1-02]" });
    item("E1-02", { depende: "[E1-01]" });
    const ciclos = hallazgos().filter((h) => h.regla === "§3.3 regla 2");
    expect(ciclos.length).toBeGreaterThan(0);
    expect(ciclos[0]?.mensaje).toContain("→");
  });

  it("un ítem `blocked` sin blocked_by es un error", () => {
    epica("E1");
    item("E1-01", { status: "blocked", fecha: "2026-01-02" });
    expect(hallazgos().some((h) => h.regla === "§3.3 regla 6")).toBe(true);
  });

  it("un ítem `blocked` hereda el blocked_by de su épica", () => {
    epica("E1", "blocked_by: falta que la contraparte responda\n");
    item("E1-01", { status: "blocked", fecha: "2026-01-02" });
    expect(hallazgos()).toEqual([]);
  });

  it("avisa cuando blocked_by es demasiado largo para una celda", () => {
    epica("E1");
    item("E1-01", { status: "blocked", fecha: "2026-01-02", bloqueado: "x".repeat(200) });
    const aviso = hallazgos().find((h) => h.gravedad === "aviso");
    expect(aviso?.mensaje).toContain("línea corta");
  });

  it("la épica del encabezado tiene que existir y coincidir con el id", () => {
    epica("E1");
    escribir(
      "E2-01.md",
      "---\nid: E2-01\nepic: E1\ntitle: x\npriority: P1\nstatus: todo\n---\n\n## Criteria\n",
    );
    expect(hallazgos().some((h) => h.mensaje.includes("no coincide"))).toBe(true);
  });
});

describe("reglas del criterio", () => {
  it("un criterio de un ítem `done` necesita ancla y verificación", () => {
    epica("E1");
    item("E1-01", {
      status: "done",
      fecha: "2026-01-02",
      impacto: true,
      criterios: "\n### E1-01.1 — Sin nada\n\n**Dado** algo, **entonces** otra cosa.\n",
    });
    const reglas = hallazgos().filter((h) => h.regla === "§2.2 regla 3");
    expect(reglas).toHaveLength(2);
  });

  it("un criterio de un ítem abierto puede no tener ancla", () => {
    epica("E1");
    item("E1-01", { criterios: "\n### E1-01.1 — Todavía no\n\n**Dado** algo, **entonces** otra cosa.\n" });
    expect(hallazgos()).toEqual([]);
  });

  it("`anchor: none` sin motivo es un error", () => {
    epica("E1");
    item("E1-01", {
      criterios: "\n### E1-01.1 — Algo\n\n**Dado** x, **entonces** y.\n\n- anchor: `none`\n- verify: `manual`\n",
    });
    expect(hallazgos().some((h) => h.regla === "§2.3 ancla")).toBe(true);
  });

  it("`anchor: none` con motivo es válida", () => {
    epica("E1");
    item("E1-01", {
      criterios:
        "\n### E1-01.1 — Algo\n\n**Dado** x, **entonces** y.\n\n- anchor: `none` — vive fuera del repositorio\n- verify: `manual`\n",
    });
    expect(hallazgos()).toEqual([]);
  });

  it("un tipo de verificación desconocido es un error", () => {
    epica("E1");
    item("E1-01", {
      criterios: "\n### E1-01.1 — Algo\n\n**Dado** x, **entonces** y.\n\n- verify: `smoke`\n",
    });
    expect(hallazgos().some((h) => h.mensaje.includes("smoke"))).toBe(true);
  });

  it("un identificador de criterio repetido es un error", () => {
    epica("E1");
    item("E1-01", { criterios: CRITERIO_COMPLETO + CRITERIO_COMPLETO });
    expect(hallazgos().some((h) => h.mensaje.includes("repetido"))).toBe(true);
  });
});

describe("comparar: el orden es numérico, no alfabético", () => {
  it("E4-07 va antes que E19-01", () => {
    expect(["E19-01", "E4-07"].sort(comparar)).toEqual(["E4-07", "E19-01"]);
  });

  it("E19-2 va antes que E19-10", () => {
    expect(["E19-10", "E19-02"].sort(comparar)).toEqual(["E19-02", "E19-10"]);
  });
});
