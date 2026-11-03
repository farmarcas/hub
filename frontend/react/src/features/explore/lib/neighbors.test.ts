import { describe, expect, it } from "vitest";
import { GRAPH } from "./fixtures";
import { neighborOrbits, relatedSolutions } from "./neighbors";

describe("neighborOrbits", () => {
  it("lista grupos que dividem soluções com o grupo em foco", () => {
    expect(neighborOrbits(GRAPH, "g-ops").map(({ id }) => id)).toEqual(["g-com", "d-com"]);
  });
});

describe("relatedSolutions", () => {
  it("mostra a relação direta antes das que vêm por um grupo em comum", () => {
    expect(relatedSolutions(GRAPH, "s2").map(({ solution, via }) => [solution.name, via])).toEqual([
      ["Radar E-commerce (Portal)", null],
      ["Órbita", "Comercial"],
    ]);
  });
});
