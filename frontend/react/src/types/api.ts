// Contrato da API (specs/001-hub-inovacao/contracts/api.md).
export type GroupType = "Tema" | "Diretoria";
export type SolutionStatus = "Em avaliação" | "Publicada";

export type NamedRef = { id: string; name: string };

export type Identity = { id: string; name: string; email: string; isAdmin: boolean };

export type PageMeta = { page: number; pageSize: number; total: number };
export type Page<T, M = PageMeta> = { data: T[]; meta: M };

export type GraphGroup = {
  id: string;
  type: GroupType;
  name: string;
  description: string | null;
  solutionCount: number;
};

export type GraphSolution = {
  id: string;
  name: string;
  url: string;
  objective: string;
  description: string;
  category: string;
  groupIds: string[];
  relatedIds: string[];
};

export type Graph = { groups: GraphGroup[]; solutions: GraphSolution[] };

export type SolutionDetail = {
  id: string;
  name: string;
  url: string;
  objective: string;
  description: string;
  category: NamedRef;
  status: SolutionStatus;
  archived: boolean;
  groups: (NamedRef & { type: GroupType })[];
  related: NamedRef[];
  access: { all: boolean; groups: NamedRef[]; users: NamedRef[] };
};

export type SolutionCounts = { published: number; inReview: number; archived: number };

export type SolutionPayload = {
  name: string;
  url: string;
  objective: string;
  description: string;
  categoryId: string;
  status: SolutionStatus;
  groupIds: string[];
  relatedIds: string[];
  access: { all: boolean; groupIds: string[]; userIds: string[] };
};

export type Category = NamedRef;

export type GroupSummary = {
  id: string;
  type: GroupType;
  name: string;
  description: string | null;
  solutionCount: number;
  memberCount: number;
  solutions: NamedRef[];
  members: (NamedRef & { email: string })[];
};

export type GroupPayload = { type: GroupType; name: string; description: string | null };

export type DeletionImpact = {
  solutions: NamedRef[];
  members: NamedRef[];
  orphanedByGroup: NamedRef[];
  orphanedByAccess: NamedRef[];
};

export type UserRow = Identity & {
  groups: (NamedRef & { type: GroupType })[];
  accessibleSolutionCount: number;
};
