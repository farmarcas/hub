import { describe, expect, it } from "vitest";
import { GRAPH } from "./fixtures";
import { buildLayout, GROUP_RADIUS, positionOf, SOLUTION_RADIUS } from "./layout";
import { distance } from "./vector";

const layout = () => buildLayout(GRAPH.groups, GRAPH.solutions);

describe("buildLayout", () => {
  it("coloca grupos na órbita interna e soluções na superfície", () => {
    const result = layout();

    expect(Math.hypot(...positionOf(result, "g-com"))).toBeCloseTo(GROUP_RADIUS);
    expect(Math.hypot(...positionOf(result, "s2"))).toBeCloseTo(SOLUTION_RADIUS);
  });

  it("é determinístico: a mesma entrada gera as mesmas posições", () => {
    expect(layout().directions).toEqual(layout().directions);
  });

  it("afasta as soluções umas das outras", () => {
    const result = layout();
    const ids = GRAPH.solutions.map(({ id }) => id);
    for (const a of ids) {
      for (const b of ids) {
        if (a === b) continue;
        expect(distance(result.directions[a]!, result.directions[b]!)).toBeGreaterThan(0.5);
      }
    }
  });

  it("liga solução a grupo e solução a solução sem duplicar a relação simétrica", () => {
    const result = layout();

    expect(result.edges.filter(({ type }) => type === "related")).toEqual([
      { a: "s2", b: "s5", type: "related" },
    ]);
    expect(result.neighbors["s2"]).toEqual(["g-com", "d-com", "s5"]);
  });
});
