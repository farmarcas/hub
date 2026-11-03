import type { Graph } from "@/types/api";

// Recorte do seed do protótipo, usado nos testes das funções do globo.
export const GRAPH: Graph = {
  groups: [
    { id: "g-com", type: "Tema", name: "Comercial", description: null, solutionCount: 3 },
    { id: "g-ops", type: "Tema", name: "Operação", description: null, solutionCount: 2 },
    { id: "d-com", type: "Diretoria", name: "Dir. Comercial", description: null, solutionCount: 2 },
    {
      id: "d-tec",
      type: "Diretoria",
      name: "Dir. Tecnologia",
      description: null,
      solutionCount: 1,
    },
  ],
  solutions: [
    {
      id: "s2",
      name: "Radar CRM",
      url: "https://crm",
      objective: "",
      description: "",
      category: "Micro SaaS",
      groupIds: ["g-com", "d-com"],
      relatedIds: ["s5"],
    },
    {
      id: "s5",
      name: "Radar E-commerce (Portal)",
      url: "https://portal",
      objective: "",
      description: "",
      category: "Micro SaaS",
      groupIds: ["g-com", "g-ops", "d-com"],
      relatedIds: ["s2"],
    },
    {
      id: "s6",
      name: "Órbita",
      url: "https://orbita",
      objective: "",
      description: "",
      category: "Micro SaaS",
      groupIds: ["g-com", "g-ops"],
      relatedIds: [],
    },
    {
      id: "s8",
      name: "Sonar",
      url: "https://sonar",
      objective: "",
      description: "",
      category: "Ferramenta Interna",
      groupIds: ["d-tec"],
      relatedIds: [],
    },
  ],
};
