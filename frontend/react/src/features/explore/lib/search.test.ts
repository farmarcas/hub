import { describe, expect, it } from "vitest";
import type { Graph } from "@/types/api";
import { GRAPH } from "./fixtures";
import { MAX_RESULTS, searchGraph } from "./search";

describe("searchGraph", () => {
  it("encontra por parte do nome, sem diferenciar maiúsculas, com o tipo", () => {
    expect(searchGraph(GRAPH, "crm")).toEqual([{ id: "s2", name: "Radar CRM", kind: "SOLUÇÃO" }]);
  });

  it("ignora acentos", () => {
    expect(searchGraph(GRAPH, "operacao").map(({ kind }) => kind)).toEqual(["TEMA"]);
  });

  it("devolve no máximo 7 resultados", () => {
    const many: Graph = {
      groups: [],
      solutions: Array.from({ length: 12 }, (_, index) => ({
        ...GRAPH.solutions[0]!,
        id: `s${index}`,
        name: `Radar ${index}`,
      })),
    };

    expect(searchGraph(many, "radar")).toHaveLength(MAX_RESULTS);
  });

  it("não busca com texto vazio", () => {
    expect(searchGraph(GRAPH, "  ")).toEqual([]);
  });
});
