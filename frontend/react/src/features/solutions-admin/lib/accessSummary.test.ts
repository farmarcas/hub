import { describe, expect, it } from "vitest";
import { accessSummary } from "./accessSummary";

const ref = (id: string) => ({ id, name: id });

describe("accessSummary", () => {
  it("mostra toda a empresa quando a regra geral está ligada", () => {
    expect(accessSummary({ all: true, groups: [ref("g")], users: [] })).toBe("Toda a empresa");
  });

  it("combina grupos e pessoas com +", () => {
    expect(accessSummary({ all: false, groups: [ref("a"), ref("b")], users: [ref("u")] })).toBe(
      "2 grupos + 1 pessoa",
    );
  });

  it("usa singular e plural corretos", () => {
    expect(accessSummary({ all: false, groups: [ref("a")], users: [] })).toBe("1 grupo");
    expect(accessSummary({ all: false, groups: [], users: [ref("a"), ref("b")] })).toBe(
      "2 pessoas",
    );
  });

  it("avisa quando não há regra", () => {
    expect(accessSummary({ all: false, groups: [], users: [] })).toBe("Sem regra de acesso");
  });
});
