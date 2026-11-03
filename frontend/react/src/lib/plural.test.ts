import { describe, expect, it } from "vitest";
import { peopleCountLabel, solutionCountLabel } from "./plural";

describe("contagens", () => {
  it("usa singular só para 1", () => {
    expect(solutionCountLabel(0)).toBe("0 soluções");
    expect(solutionCountLabel(1)).toBe("1 solução");
    expect(solutionCountLabel(6)).toBe("6 soluções");
    expect(peopleCountLabel(1)).toBe("1 pessoa");
    expect(peopleCountLabel(3)).toBe("3 pessoas");
  });
});
