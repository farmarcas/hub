# Especificação: Hub de Inovação Farmarcas (MVP)

**Feature Branch**: `claude/nova-aplicacao-cdc5de`

**Created**: 2026-10-15

**Status**: Draft

**Input**: Documento de visão "Product Vision — Hub de Inovação Farmarcas", especificação de design "Handoff: Hub de Inovação Farmarcas (v5 — Órbita)" e protótipo clicável "Hub de Inovacao v5".

## Visão em uma frase

Ser o lugar único onde qualquer colaborador da Farmarcas descobre, acessa e entende as soluções criadas pelas equipes internas, e onde a empresa governa esse portfólio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin cadastra e mantém as soluções (Priority: P1)

O administrador do Hub vê a lista de todas as soluções com status, temas/diretorias ligados e um resumo de quem acessa. Ele cadastra uma solução nova (nome, endereço, objetivo, descrição curta, categoria e status), define em quais temas e diretorias ela aparece, quais outras soluções são relacionadas e quem pode vê-la. Depois pode editar, arquivar e restaurar.

**Why this priority**: sem soluções cadastradas, com dono e regra de acesso, o Hub não tem conteúdo. É a base de tudo o que o colaborador vê.

**Independent Test**: um admin cadastra uma solução completa, vê a solução na lista com o resumo correto, edita, arquiva e restaura. Também confere que o cadastro é recusado sem tema/diretoria ou sem regra de acesso.

**Acceptance Scenarios**:

1. **Given** um admin na lista de soluções, **When** ele abre a tela, **Then** vê a contagem "N publicadas · N em avaliação · N arquivadas" e, para cada solução, nome, categoria, status, chips de temas/diretorias, resumo de acesso ("Toda a empresa", "2 grupos", "1 pessoa", combinados com "+") e as ações Editar e Arquivar/Restaurar.
2. **Given** o formulário de nova solução preenchido, mas sem nenhum tema ou diretoria marcado, **When** o admin tenta salvar, **Then** o sistema não salva e mostra "Sem tema ou diretoria, a solução ficaria solta no grafo."
3. **Given** o formulário preenchido, mas sem nenhuma regra de acesso, **When** o admin tenta salvar, **Then** o sistema não salva e mostra "Defina ao menos uma regra de acesso."
4. **Given** o admin marcou "Toda a empresa", **When** olha as opções de grupos e pessoas, **Then** elas aparecem esmaecidas, porque a regra geral já cobre todos.
5. **Given** o admin precisa de uma categoria que não existe, **When** ele cria uma nova direto no formulário, **Then** ela fica disponível para esta e para as próximas soluções.
6. **Given** uma solução publicada, **When** o admin a arquiva, **Then** ela some da exploração de todos os colaboradores e aparece como arquivada na lista, podendo ser restaurada.
7. **Given** o admin informa um endereço que não começa com "https://", **When** tenta salvar, **Then** o sistema recusa e explica o motivo.
8. **Given** o formulário com relações escolhidas, **When** o admin olha a prévia, **Then** vê "NO GRAFO: <nome> conecta a …" com os temas, diretorias e soluções escolhidos.

---

### User Story 2 - Admin organiza grupos (temas e diretorias) e seus membros (Priority: P1)

O admin cria, edita e exclui grupos do tipo Tema (assunto de negócio, ex.: Comercial, Dados & BI) ou Diretoria (quem patrocina, ex.: Dir. Tecnologia). Para cada grupo, escolhe quem faz parte, entre os usuários já existentes.

**Why this priority**: grupos são, ao mesmo tempo, o lugar onde a solução aparece no mapa e a forma mais comum de dar acesso. Sem eles não há como cadastrar soluções.

**Independent Test**: criar um tema e uma diretoria, adicionar e remover pessoas, editar o nome e excluir um grupo, conferindo o aviso de impacto antes da exclusão.

**Acceptance Scenarios**:

1. **Given** a tela de grupos, **When** o admin filtra por Todos, Temas ou Diretorias, **Then** a lista mostra só aquele tipo, com "N soluções · N pessoas" em cada grupo.
2. **Given** o admin cria ou edita um grupo, **When** deixa o nome vazio ou repete o nome de outro grupo, **Then** o sistema não salva e explica o motivo.
3. **Given** um grupo aberto, **When** o admin adiciona uma pessoa da lista de usuários, **Then** ela passa a aparecer em "Pessoas no grupo" e a ver as soluções liberadas para esse grupo.
4. **Given** um grupo aberto, **When** o admin remove uma pessoa, **Then** ela deixa de ver as soluções que só eram liberadas por esse grupo.
5. **Given** um grupo ligado a soluções, **When** o admin pede para excluí-lo, **Then** o sistema mostra antes quantas soluções e pessoas são afetadas e lista as soluções que ficariam sem nenhum tema/diretoria ou sem nenhuma regra de acesso. Só exclui após a confirmação.
6. **Given** a exclusão confirmada, **When** ela termina, **Then** o grupo sai das relações das soluções, das regras de acesso e da lista de membros.

---

### User Story 3 - Colaborador vê só o que tem direito (Priority: P1)

Cada colaborador, ao entrar no Hub, enxerga apenas as soluções publicadas e não arquivadas que ele pode acessar.

**Why this priority**: acesso centralizado é uma das promessas centrais do Hub, e mostrar uma solução a quem não deve é risco de exposição de dados.

**Independent Test**: com usuários de exemplo em grupos diferentes, entrar como cada um e conferir que cada pessoa vê exatamente as soluções a que tem direito.

**Acceptance Scenarios**:

1. **Given** uma solução liberada para "Toda a empresa", **When** qualquer colaborador entra, **Then** ele a vê.
2. **Given** uma solução liberada para o grupo "Dir. Comercial", **When** entra uma pessoa que não é desse grupo nem está listada na solução, **Then** ela não vê a solução em lugar nenhum: mapa, busca, painel ou lista de relacionadas.
3. **Given** uma solução liberada para uma pessoa específica, **When** essa pessoa entra, **Then** ela vê a solução, mesmo sem pertencer a nenhum grupo liberado.
4. **Given** uma solução com status "Em avaliação" ou arquivada, **When** qualquer colaborador explora o Hub, **Then** ela não aparece.
5. **Given** alguém tenta obter diretamente os dados de uma solução que não pode ver, **When** o pedido chega ao sistema, **Then** é recusado. A proteção não depende do que a tela esconde.

---

### User Story 4 - Colaborador explora as soluções no globo (Priority: P2)

O colaborador abre o Hub e vê um globo: no centro o Núcleo, numa órbita interna os temas e diretorias, na superfície as soluções, ligadas por arcos. Ele gira, aproxima, passa o mouse para destacar vizinhos, clica para focar, busca pelo nome, segue a trilha "Núcleo / Tema / Solução" e lê o painel de detalhes. No painel, abre a solução em nova aba.

**Why this priority**: é a experiência de descoberta que diferencia o Hub. Ela depende das histórias P1 (conteúdo e acesso) para ter o que mostrar.

**Independent Test**: com os dados de exemplo, um colaborador encontra a solução "Radar CRM" pela busca e pela navegação Tema → Solução, lê o objetivo e abre o link em nova aba.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** o colaborador entra, **Then** vê o globo com temas (círculo vazado), diretorias (losango) e soluções (ponto cheio), uma legenda e a dica "Arraste para girar · role para aproximar · Esc volta".
2. **Given** o globo, **When** o colaborador arrasta ou usa a roda do mouse, **Then** o globo gira (com inércia) ou aproxima/afasta dentro de um limite. Sem interação, gira devagar sozinho.
3. **Given** o mouse sobre um nó, **When** ele para ali, **Then** o nó e seus vizinhos acendem e o resto esmaece.
4. **Given** um clique em um tema, diretoria ou solução, **When** o foco muda, **Then** o globo gira até o nó ficar de frente, aproxima um pouco e a trilha passa a mostrar o caminho (ex.: "Núcleo / Comercial / Radar CRM").
5. **Given** um nó em foco, **When** o colaborador aperta Esc, **Then** volta um nível na trilha.
6. **Given** a busca, **When** o colaborador digita parte de um nome, **Then** aparecem até 7 resultados entre temas, diretorias e soluções que ele pode ver, cada um com o tipo (TEMA / DIRETORIA / SOLUÇÃO). Escolher um resultado foca o nó.
7. **Given** o painel de detalhes, **When** o foco é o Núcleo, **Then** mostra "Toda a inovação Farmarcas, em órbita." e a lista de temas e diretorias com o número de soluções de cada um.
8. **Given** o foco em um tema ou diretoria, **When** o painel abre, **Then** mostra a descrição, as "Órbitas vizinhas" (grupos que compartilham soluções) e as "Soluções em órbita · N".
9. **Given** o foco em uma solução, **When** o painel abre, **Then** mostra categoria, nome, descrição, objetivo, o botão "Abrir solução ↗", os temas e diretorias e as relacionadas (relação direta ou "via <grupo>").
10. **Given** o botão "Abrir solução ↗", **When** o colaborador clica, **Then** a solução abre no endereço cadastrado, em nova aba, sem sair do Hub.
11. **Given** o painel fechado, **When** o colaborador passa o mouse no ícone da borda direita, **Then** o painel abre e fecha pouco depois que o mouse sai. Clicar no ícone ou numa solução deixa o painel fixo, e o X fecha.
12. **Given** uma pessoa que pediu ao sistema para reduzir animações, **When** abre o Hub, **Then** o globo e os painéis funcionam sem movimentos automáticos.

---

### User Story 5 - Admin consulta a lista de usuários (Priority: P2)

O admin vê todos os usuários internos, com nome, e-mail, grupos de que fazem parte no Hub e quantas soluções cada um acessa. A lista é só de leitura: ninguém é criado nem editado no Hub.

**Why this priority**: ajuda o admin a conferir quem vê o quê, mas não bloqueia o uso básico.

**Independent Test**: abrir a tela e conferir, para os 6 usuários de exemplo, os grupos e o número de soluções acessíveis.

**Acceptance Scenarios**:

1. **Given** a tela de usuários, **When** o admin abre, **Then** vê o aviso "Lista herdada do Radar" e uma tabela com nome (com iniciais), e-mail, grupos no Hub e número de soluções que a pessoa acessa.
2. **Given** a tela de usuários, **When** o admin procura um botão de criar ou editar, **Then** não existe. O aviso orienta a usar a tela de Grupos para incluir alguém em um grupo.

---

### User Story 6 - Todos leem as Políticas (Priority: P3)

Qualquer colaborador abre as Políticas pelo botão no canto superior direito e lê três abas: "Como criar uma solução", "Como publicar" e "Governança". O conteúdo é de exemplo até sair o texto oficial.

**Why this priority**: dá transparência ao processo, mas no MVP o pedido de publicação continua fora do Hub.

**Independent Test**: abrir Políticas de qualquer tela, navegar pelas três abas e conferir o aviso de conteúdo de exemplo.

**Acceptance Scenarios**:

1. **Given** qualquer tela, **When** o colaborador clica em "Políticas", **Then** vê o título "Como as equipes criam, publicam e mantêm soluções no Hub." e o aviso "Conteúdo de exemplo — substituir pela política oficial aprovada."
2. **Given** a tela de Políticas, **When** o colaborador troca de aba, **Then** vê:
   - **Criar:** os 4 passos para criar.
   - **Publicar:** o checklist e o fluxo Pedido → Cadastro em avaliação → Publicação.
   - **Governança:** o ciclo Ideia → Avaliação → Piloto → Publicada → Revisão semestral, os papéis e a regra de arquivamento.

---

### Edge Cases

- **Solução sem nenhuma solução relacionada:** é permitido. Só tema/diretoria e acesso são obrigatórios.
- **Relação de mão única:** se A foi ligada a B, B também mostra A como relacionada, mesmo sem cadastro no sentido inverso.
- **Relacionada que a pessoa não pode ver:** não aparece na lista de relacionadas dela.
- **Acesso por mais de um caminho:** quem está num grupo liberado e também listado nominalmente vê a solução uma única vez.
- **Exclusão que deixa solução sem regra:** se excluir um grupo deixaria uma solução sem tema/diretoria ou sem regra de acesso, o aviso lista essas soluções. O admin precisa corrigi-las depois, e elas não aparecem para ninguém até lá.
- **Colaborador sem nenhuma solução visível:** o globo mostra o Núcleo e os grupos, sem soluções, e o painel explica que não há soluções liberadas para ele.
- **Busca sem resultado:** a lista informa que nada foi encontrado.
- **Pessoa não-admin:** não vê os itens Soluções, Grupos e Usuários no menu e não consegue usar essas funções mesmo acessando o endereço direto.
- **Nome de categoria repetido:** o sistema não cria categoria duplicada, ignorando diferença de maiúsculas e minúsculas e espaços nas pontas.

## Requirements *(mandatory)*

### Functional Requirements

**Soluções (admin)**

- **FR-001**: O sistema MUST permitir ao admin listar todas as soluções, inclusive em avaliação e arquivadas, com a contagem por situação.
- **FR-002**: O sistema MUST permitir ao admin criar e editar uma solução com: nome, endereço (https obrigatório), objetivo, descrição curta (uma linha), categoria e status (Em avaliação ou Publicada).
- **FR-003**: A categoria MUST ser uma lista aberta: o admin escolhe uma existente ou cria uma nova no próprio formulário.
- **FR-004**: O sistema MUST exigir ao menos um tema ou diretoria ligado à solução para salvar.
- **FR-005**: O sistema MUST exigir ao menos uma regra de acesso para salvar: toda a empresa, um ou mais grupos e/ou uma ou mais pessoas. As regras podem ser combinadas.
- **FR-006**: As regras FR-004 e FR-005 MUST valer também quando a validação da tela é contornada.
- **FR-007**: O admin MUST poder ligar a solução a outras soluções (opcional). A ligação vale nos dois sentidos na exibição.
- **FR-008**: O admin MUST poder arquivar e restaurar uma solução. Arquivar não apaga os dados.

**Grupos (admin)**

- **FR-009**: O admin MUST poder criar, editar e excluir grupos com nome (obrigatório, único), tipo (Tema ou Diretoria) e descrição opcional.
- **FR-010**: O admin MUST poder adicionar e remover membros de um grupo, escolhendo entre os usuários existentes.
- **FR-011**: Antes de excluir um grupo, o sistema MUST mostrar o impacto: soluções e pessoas afetadas, e quais soluções ficariam sem tema/diretoria ou sem regra de acesso.
- **FR-012**: Ao excluir um grupo, o sistema MUST removê-lo das relações das soluções, das regras de acesso e das participações.

**Usuários e acesso**

- **FR-013**: O sistema MUST mostrar ao admin a lista de usuários (nome, e-mail, grupos, número de soluções acessíveis) somente para leitura.
- **FR-014**: Usuários MUST NOT ser criados nem editados no Hub.
- **FR-015**: Um colaborador MUST ver uma solução somente se ela estiver publicada, não arquivada e se valer pelo menos uma destas condições:
  - está liberada para toda a empresa;
  - a pessoa está listada nominalmente;
  - a pessoa é membro de algum grupo liberado.
- **FR-016**: O filtro do FR-015 MUST ser aplicado pelo sistema antes de entregar qualquer dado: mapa, busca, painel, relacionadas e contagens.
- **FR-017**: Somente admins MUST ver e usar as funções de Soluções, Grupos e Usuários. Para o admin, elas são itens a mais no menu, não outra área.

**Exploração**

- **FR-018**: A tela inicial MUST mostrar o globo com o Núcleo, os grupos e as soluções visíveis para a pessoa, ligados por arcos (solução–grupo e solução–solução).
- **FR-019**: O colaborador MUST poder girar, aproximar/afastar (com limites), destacar vizinhos ao passar o mouse, focar um nó com clique e voltar um nível com Esc.
- **FR-020**: O sistema MUST mostrar a trilha de navegação "Núcleo / Grupo / Solução".
- **FR-021**: O sistema MUST oferecer busca por nome entre temas, diretorias e soluções visíveis, com até 7 resultados e o tipo de cada um.
- **FR-022**: O sistema MUST oferecer o painel de detalhes com o conteúdo de cada tipo de foco descrito na User Story 4.
- **FR-023**: Abrir uma solução MUST sempre abrir o endereço cadastrado em nova aba, sem embutir a solução no Hub.
- **FR-024**: O sistema MUST respeitar a preferência de "reduzir movimento" da pessoa.

**Políticas e estrutura**

- **FR-025**: Todos os usuários MUST poder abrir as Políticas pelo botão do cabeçalho, com as três abas e o aviso de conteúdo de exemplo.
- **FR-026**: O sistema MUST NOT ter tela de login própria. A pessoa chega ao Hub já identificada (ver Premissas).
- **FR-027**: O sistema MUST carregar os dados de exemplo do protótipo: 9 grupos, 11 soluções, 6 usuários e 4 categorias.

### Key Entities

- **Usuário**: pessoa interna da Farmarcas que usa o Hub. Tem nome, e-mail e a marcação de admin. Origem: Radar (no MVP, carga de exemplo).
- **Grupo**: Tema (assunto de negócio) ou Diretoria (patrocinadora). Tem nome único e descrição. É nó do mapa e pode ser usado para liberar acesso.
- **Participação em grupo**: liga um usuário a um grupo. Só o admin gerencia.
- **Solução**: produto interno catalogado. Tem nome, endereço, objetivo, descrição curta, categoria, status e a marcação de arquivada.
- **Categoria**: rótulo livre da solução (ex.: Micro SaaS, Ferramenta Interna, Relatório / BI, Documentação).
- **Relação no mapa**: liga a solução a grupos (obrigatória, ≥ 1) e a outras soluções (opcional, vale nos dois sentidos).
- **Regra de acesso**: define quem vê a solução: toda a empresa, grupos e/ou pessoas. Pode combinar mais de uma.
- **Política**: conteúdo de leitura em três seções (criar, publicar, governança).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das soluções salvas têm ao menos um tema/diretoria e uma regra de acesso. O produto garante isso, e é conferível na lista de soluções.
- **SC-002**: Em teste com os 6 usuários de exemplo, cada pessoa vê exatamente as soluções a que tem direito, sem nenhuma a mais nem a menos.
- **SC-003**: Um colaborador encontra uma solução conhecida pela busca e a abre em menos de 30 segundos a partir da tela inicial.
- **SC-004**: Um admin cadastra uma solução completa em menos de 3 minutos.
- **SC-005**: As 11 soluções do inventário de exemplo estão cadastradas e navegáveis no primeiro uso.
- **SC-006**: Após o MVP: o número de colaboradores ativos no Hub por mês, dividido pelo total de usuários do Radar, cresce mês a mês. Também cai o número de pedidos "onde fica a ferramenta X?" aos times.

## Assumptions

- **Identificação sem login próprio**: a integração com o Radar está em aberto. No MVP, a pessoa entra como um dos usuários de exemplo, escolhido de forma simples no ambiente local, e não há tela de login.
  - Decisão: identificação simulada no MVP. Por quê: a visão pede "autenticação herdada do Radar" e "autenticação mock" até a integração.
  - A troca pela integração real é uma funcionalidade futura. A segurança de login não tem procedimento padrão neste projeto e será tratada nela.
- **Quem é admin**: marcação guardada no próprio Hub e preenchida na carga de exemplo, com pelo menos um admin entre os 6 usuários.
  - Decisão: marcação no Hub. Por quê: é o caminho que não depende de mudança no Radar. Pode migrar para o Radar depois.
- **Dados de exemplo**: grupos, soluções, usuários, participações e categorias são os do protótipo v5. Os endereços das soluções são fictícios.
- **Políticas**: o texto de exemplo do protótipo entra como conteúdo fixo no MVP. Edição pelo admin fica para depois (a visão marca como "idealmente").
- **Pedido de publicação**: continua fora do Hub. O time pede ao admin, que cadastra como "Em avaliação" e depois publica.
- **Marca**: provisória, um quadrado laranja com a letra "H".
- **Visual**: segue o protótipo v5 e a especificação de design (tema escuro, laranja Farmarcas, fonte Rubik). Os detalhes ficam para o plano.
- **Fora do MVP**: métricas de uso, favoritos, notificações, convite por e-mail, pedido de publicação no Hub, solução embutida, sincronização de grupos com organograma, comentários, avaliações e versionamento.
- **Uso**: no computador (navegador de mesa). O globo deve funcionar em telas de notebook. Celular não é prioridade no MVP.
