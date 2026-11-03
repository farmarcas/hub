# Especificação: Explorar no celular em lista (sem globo)

**Feature Branch**: `claude/nova-aplicacao-cdc5de`

**Created**: 2026-10-16

**Status**: Draft

**Input**: "No celular vamos mostrar a lista não precisamos mostrar o globo"

**Base**: evolui a User Story 4 (exploração) de [001-hub-inovacao](../001-hub-inovacao/spec.md) e o painel do Núcleo de [003-painel-nucleo-previa](../003-painel-nucleo-previa/spec.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar pelas soluções no celular por uma lista (Priority: P1)

No celular, a tela Explorar não mostra o globo. Ela mostra o mesmo conteúdo do painel, ocupando a tela inteira e em três níveis:
- **Núcleo:** a lista de temas e diretorias em cartões, com o número de soluções;
- **Tema ou diretoria:** as soluções dele;
- **Solução:** os detalhes e o botão para abrir.

A busca e a trilha "Núcleo / Grupo / Solução" continuam no topo.

**Why this priority**: o globo é pequeno demais para tocar com o dedo, e a lista é o jeito mais rápido de achar uma solução no celular.

**Independent Test**: num celular, encontrar e abrir "Radar Marketing" só tocando em cartões (Núcleo → Marketing → Radar Marketing → Abrir solução) e também pela busca.

**Acceptance Scenarios**:

1. **Given** a tela Explorar num celular, **When** ela abre, **Then** não aparece o globo, as partículas, a legenda nem o botão de abrir o painel. Aparecem:
   - a trilha e a busca;
   - o texto do Núcleo;
   - a lista de temas e diretorias em cartões (ícone, nome, descrição, "N soluções").
2. **Given** a lista do Núcleo, **When** a pessoa toca num tema ou diretoria, **Then** vê a página dele (descrição, órbitas vizinhas e soluções), e a trilha passa a "Núcleo / <grupo>".
3. **Given** a página de um grupo, **When** a pessoa toca numa solução, **Then** vê os detalhes (categoria, descrição, objetivo, temas e diretorias, relacionadas) e o botão **Abrir solução ↗**, que abre em nova aba.
4. **Given** qualquer nível, **When** a pessoa toca num item da trilha, **Then** volta para aquele nível.
5. **Given** a busca, **When** a pessoa escolhe um resultado, **Then** vai direto para a página daquele tema, diretoria ou solução.
6. **Given** a pessoa gira o celular ou aumenta a janela até o tamanho de tablet, **When** a tela passa desse ponto, **Then** o globo volta, mantendo o mesmo caminho.
7. **Given** a lista, **When** a pessoa a vê, **Then** só aparecem as soluções que ela pode ver, a mesma regra do globo.

### Edge Cases

- **Pessoa sem nenhuma solução liberada:** a lista mostra os grupos com "0 soluções" e o aviso "Ainda não há soluções liberadas para você".
- **Grupo com 0 soluções:** a página dele mostra "Nenhuma solução visível para você."
- **Voltar do navegador:** segue o comportamento atual; a trilha é o caminho para voltar de nível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em telas de celular (largura abaixo da de tablet), a tela Explorar MUST mostrar a lista em vez do globo. Do tablet para cima, nada muda.
- **FR-002**: A lista MUST ter os mesmos três níveis e o mesmo conteúdo do painel de detalhes, ocupando a largura toda.
- **FR-003**: A trilha e a busca MUST continuar funcionando na lista.
- **FR-004**: A lista MUST mostrar só o que a pessoa pode ver, igual ao globo.
- **FR-005**: Os cartões e os itens MUST ser fáceis de tocar com o dedo (área de toque confortável).

## Success Criteria *(mandatory)*

- **SC-001**: No celular, uma pessoa abre uma solução conhecida em até 3 toques a partir da tela inicial (ou pela busca).
- **SC-002**: Nenhum elemento do globo aparece em celular, nos três navegadores testados (Chrome, Firefox, Safari).
- **SC-003**: Do tablet para cima, a tela continua igual à de hoje.

## Assumptions

- **Ponto de corte:**
  - Decisão: a lista vale abaixo de 768 px de largura (celular). Tablet e computador mantêm o globo.
  - Por quê: é o mesmo ponto que o projeto já usa para separar celular de tablet.
- **Sem prévia no celular:** não existe "passar o mouse" no toque. Tocar no cartão entra no grupo.
- **Telas de administração não mudam aqui.** A tabela de Soluções no celular é um assunto separado.
