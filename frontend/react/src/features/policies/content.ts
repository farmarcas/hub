// Conteúdo de exemplo copiado do protótipo v5. Substituir pela política oficial aprovada.
export type PolicyTabId = "create" | "publish" | "governance";

export type PolicyTab = { id: PolicyTabId; number: string; label: string };

export const POLICY_TABS: PolicyTab[] = [
  { id: "create", number: "01", label: "Como criar uma solução" },
  { id: "publish", number: "02", label: "Como publicar" },
  { id: "governance", number: "03", label: "Governança" },
];

export const CREATE_STEPS = [
  {
    title: "Registre a ideia",
    text: "Descreva em uma página o problema, quem será atendido e o objetivo mensurável da solução. Ideias sem objetivo claro não seguem para avaliação.",
  },
  {
    title: "Garanta uma diretoria patrocinadora",
    text: "Toda solução tem uma diretoria responsável que prioriza, valida o uso e responde por ela. É essa diretoria que aparece ligada à solução no grafo.",
  },
  {
    title: "Construa dentro do padrão",
    text: "Use as tecnologias e fontes de dados homologadas pela Diretoria de Tecnologia. Dados de clientes e financeiros só podem vir de integrações aprovadas.",
  },
  {
    title: "Teste com quem vai usar",
    text: "Rode um piloto com um grupo restrito antes de pedir a publicação. O retorno do piloto acompanha o pedido de publicação.",
  },
];

export const PUBLISH_CHECKLIST = [
  "URL estável, com HTTPS e login funcionando",
  "Objetivo e descrição curta escritos",
  "Responsável técnico e canal de suporte definidos",
  "Regra de acesso definida — quem pode ver",
  "Relações no grafo: ao menos um tema e a diretoria patrocinadora",
  "Aprovação do Comitê de Inovação",
];

export const PUBLISH_FLOW = [
  { title: "Pedido.", text: "O time criador envia o checklist ao admin do Hub." },
  {
    title: "Cadastro em avaliação.",
    text: "O admin cadastra a solução com status “Em avaliação” — ela ainda não aparece no grafo.",
  },
  {
    title: "Publicação.",
    text: "Aprovada pelo comitê, o status muda para “Publicada” e a solução entra no grafo para quem tem acesso.",
  },
];

export const LIFECYCLE = [
  { stage: "Ideia", who: "Time criador registra" },
  { stage: "Avaliação", who: "Diretoria patrocinadora valida" },
  { stage: "Piloto", who: "Grupo restrito testa" },
  { stage: "Publicada", who: "Comitê aprova, entra no grafo" },
  { stage: "Revisão semestral", who: "Mantém, evolui ou arquiva" },
];

export const ROLES = [
  { role: "Time criador", text: "Constrói, mantém e dá suporte à solução." },
  { role: "Diretoria patrocinadora", text: "Prioriza, valida o valor e responde pelo uso." },
  { role: "Comitê de Inovação", text: "Aprova publicações e revisa o portfólio a cada semestre." },
  { role: "Admin do Hub", text: "Cadastra soluções, grupos, relações e acessos." },
];

export const ARCHIVING_RULE =
  "Solução sem responsável ativo ou sem uso por seis meses é arquivada na revisão semestral. Toda mudança de acesso é feita pelo admin do Hub.";
