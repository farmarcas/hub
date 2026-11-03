import { describe, expect, it } from "vitest";
import { labelPriority, placeLabels } from "./labels";

const box = (x: number) => ({ x0: x, x1: x + 50, y0: 0, y1: 18 });

describe("placeLabels", () => {
  it("mantém o rótulo de maior prioridade quando dois colidem", () => {
    const placed = placeLabels([
      { item: "solução", box: box(0), priority: 0.5 },
      { item: "foco", box: box(10), priority: 4 },
      { item: "longe", box: box(200), priority: 0 },
    ]);

    expect(placed.map(({ item }) => item)).toEqual(["foco", "longe"]);
  });
});

describe("labelPriority", () => {
  it("ordena foco > hover > grupo > solução", () => {
    const focus = labelPriority({ isFocus: true, isHot: true, isGroup: false, depth: 0 });
    const hover = labelPriority({ isFocus: false, isHot: true, isGroup: false, depth: 0 });
    const group = labelPriority({ isFocus: false, isHot: false, isGroup: true, depth: 0 });
    const solution = labelPriority({ isFocus: false, isHot: false, isGroup: false, depth: 0.9 });

    expect(focus).toBeGreaterThan(hover);
    expect(hover).toBeGreaterThan(group);
    expect(group).toBeGreaterThan(solution);
  });
});
