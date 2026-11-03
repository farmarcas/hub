# Especificação: Painel do Núcleo com prévia no globo

**Feature Branch**: `claude/nova-aplicacao-cdc5de`

**Created**: 2026-10-16

**Status**: Draft

**Input**: imagem de referência ([referencia.png](referencia.png)) + "ao passar o mouse na solução da direita movimenta o globo mostrando as soluções que existem dentro e o número de soluções que existe".

**Base**: evolui a User Story 4 (exploração no globo) de [001-hub-inovacao](../001-hub-inovacao/spec.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o que existe em cada tema ou diretoria antes de entrar (Priority: P1)

Com o globo no Núcleo, o colaborador abre o painel da direita e vê a lista de temas e diretorias em cartões. Cada cartão mostra:
- ícone do tipo;
- nome;
- descrição curta;
- quantas soluções ele pode ver ali.

Ao passar o mouse num cartão, o globo gira até aquele tema ou diretoria e acende as soluções ligadas a ele; o resto fica apagado. Ao tirar o mouse, o globo volta ao giro livre. Clicar no cartão entra no tema ou diretoria, como já acontece hoje.

**Why this priority**: permite descobrir o portfólio sem precisar mirar nos pontos pequenos do globo.

**Independent Test**: com o painel do Núcleo aberto, passar o mouse em "Marketing". O globo gira até Marketing, acende as soluções dele e o cartão mostra "N soluções". Tirar o mouse volta ao giro livre.

**Acceptance Scenarios**:

1. **Given** o painel do Núcleo aberto, **When** o colaborador o lê, **Then** vê:
   - o rótulo "NÚCLEO";
   - o título "Toda a inovação Farmarcas, em órbita.";
   - o texto "Temas e diretorias formam o núcleo; as soluções vivem na superfície. Gire o globo e clique para seguir as conexões.";
   - a seção "TEMAS E DIRETORIAS".
2. **Given** a seção "TEMAS E DIRETORIAS", **When** o colaborador olha um cartão, **Then** vê:
   - círculo laranja (tema) ou losango claro (diretoria);
   - o nome;
   - a descrição em uma linha, cortada com "…" se for longa;
   - à direita, "N soluções" ou "1 solução".

   A contagem considera só as soluções que **essa pessoa** pode ver.
3. **Given** o mouse sobre um cartão, **When** ele para ali, **Then**:
   - o cartão fica destacado (borda e fundo laranja suaves);
   - o globo gira até o tema ou diretoria, que fica com o rótulo visível;
   - o grupo e as soluções ligadas a ele acendem, com as linhas entre eles;
   - os demais pontos ficam apagados.
4. **Given** a prévia ativa, **When** o mouse sai do cartão (ou da lista), **Then** o destaque some e o globo volta ao giro livre do Núcleo. A trilha continua "Núcleo".
5. **Given** um cartão, **When** o colaborador clica nele, **Then** entra no tema ou diretoria, com o mesmo comportamento de hoje (trilha, foco e painel do grupo).
6. **Given** o colaborador navegando pelo teclado, **When** o foco chega num cartão, **Then** a mesma prévia acontece; Enter entra no grupo.
7. **Given** a pessoa pediu ao sistema para reduzir animações, **When** passa o mouse num cartão, **Then** o globo vai direto para o grupo, sem animação de giro.

### Edge Cases

- **Grupo com 0 soluções visíveis:** o cartão mostra "0 soluções". A prévia gira até o grupo e acende só ele.
- **Grupo sem descrição:** o cartão mostra só o nome e a contagem.
- **Mouse passando rápido por vários cartões:** o globo segue o último cartão; não fica preso num anterior.
- **Arrastar o globo durante a prévia:** o arrasto manda, e a prévia volta quando o mouse entra de novo num cartão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel do Núcleo MUST mostrar o rótulo, o título, o texto de apoio e a seção "TEMAS E DIRETORIAS", com os textos da imagem de referência.
- **FR-002**: Cada tema ou diretoria MUST aparecer como cartão com ícone do tipo, nome, descrição em uma linha e a contagem "N soluções" ou "1 solução" das soluções visíveis para a pessoa.
- **FR-003**: Passar o mouse ou o foco do teclado num cartão MUST girar o globo até o grupo e acender o grupo, as soluções ligadas a ele e as ligações, apagando o resto. A trilha de navegação não muda.
- **FR-004**: Tirar o mouse ou o foco MUST encerrar a prévia e devolver o globo ao estado do Núcleo.
- **FR-005**: Clicar ou apertar Enter num cartão MUST entrar no grupo, como hoje.
- **FR-006**: A prévia MUST respeitar "reduzir movimento".
- **FR-007**: A prévia MUST usar só o que a pessoa pode ver. Nenhuma solução fora do acesso dela acende ou entra na contagem.

## Success Criteria *(mandatory)*

- **SC-001**: Em até 1 segundo depois de parar o mouse num cartão, o grupo está de frente e destacado no globo.
- **SC-002**: A contagem de cada cartão é igual ao número de soluções que acendem na prévia.
- **SC-003**: Um colaborador encontra quantas soluções existem em um tema sem clicar em nada.

## Assumptions

- **Prévia não é navegação:** passar o mouse só mostra; a trilha e o painel não mudam. Entrar no grupo continua sendo pelo clique.
- **Só o painel do Núcleo muda de visual.** Os painéis de tema e de solução seguem como estão.
- **Ordem dos cartões:** temas primeiro, depois diretorias, cada um em ordem alfabética, como já acontece hoje.
