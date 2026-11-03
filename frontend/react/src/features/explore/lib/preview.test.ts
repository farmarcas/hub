import { describe, expect, it } from "vitest";
import { GRAPH } from "./fixtures";
import { buildLayout } from "./layout";
import { highlightSet } from "./preview";

const layout = buildLayout(GRAPH.groups, GRAPH.solutions);

describe("highlightSet", () => {
  it("acende o grupo da prévia e as soluções ligadas a ele", () => {
    expect([...highlightSet(layout, null, "g-ops")].sort()).toEqual(["g-ops", "s5", "s6"]);
  });

  it("dá prioridade ao mouse sobre o globo em relação à prévia do painel", () => {
    expect([...highlightSet(layout, "d-tec", "g-ops")].sort()).toEqual(["d-tec", "s8"]);
  });

  it("não acende nada sem mouse e sem prévia", () => {
    expect(highlightSet(layout, null, null).size).toBe(0);
  });

  it("ignora prévia de um grupo que não está no globo", () => {
    expect(highlightSet(layout, null, "g-inexistente").size).toBe(0);
  });
});
