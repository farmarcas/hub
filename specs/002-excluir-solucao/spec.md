# Especificação: Excluir solução (lista de Soluções)

**Feature Branch**: `claude/nova-aplicacao-cdc5de`

**Created**: 2026-10-16

**Status**: Draft

**Input**: "implemente crud na lista de soluções, deve haver editar e excluir solução"

**Base**: evolui a User Story 1 de [001-hub-inovacao](../001-hub-inovacao/spec.md). Criar, listar e editar já existem; esta especificação acrescenta **excluir**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin exclui uma solução da lista (Priority: P1)

Na lista de Soluções, cada linha mostra as ações **Editar** e **Excluir**. Ao clicar em Excluir, o admin vê uma confirmação com o nome da solução e o que acontece em seguida:
- ela sai do Hub para todos;
- ela some da lista;
- ela deixa de aparecer como relacionada em outras soluções.

Só depois de confirmar a exclusão acontece.

**Why this priority**: soluções cadastradas por engano ou duplicadas hoje só podem ser arquivadas e continuam ocupando a lista.

**Independent Test**: excluir uma solução de teste, confirmar que ela some da lista, do globo, da busca e das relacionadas das outras soluções, e que cancelar não muda nada.

**Acceptance Scenarios**:

1. **Given** a lista de soluções, **When** o admin olha uma linha, **Then** vê as ações Editar e Excluir. Arquivar/Restaurar continua disponível.
2. **Given** o admin clicou em Excluir, **When** a confirmação aparece, **Then** ela mostra o nome da solução, avisa que a ação não pode ser desfeita pela tela e lista as soluções relacionadas a ela, com o aviso claro de que **essas continuam no Hub** e só perdem a ligação com a excluída.
3. **Given** a confirmação aberta, **When** o admin cancela (botão ou Esc), **Then** nada muda.
4. **Given** a confirmação aberta, **When** o admin confirma, **Then** a solução some da lista e a contagem "N publicadas · N em avaliação · N arquivadas" é atualizada.
5. **Given** uma solução excluída, **When** qualquer colaborador explora o Hub, **Then** ela não aparece no globo, na busca nem nas relacionadas de outras soluções.
6. **Given** a solução excluída tinha soluções relacionadas, **When** a exclusão termina, **Then** cada relacionada continua existindo, sem nenhuma alteração além de perder essa ligação: mesmos dados, status, temas, regras de acesso e outras relações. Ela continua na lista e no globo para quem já a via.
7. **Given** uma solução excluída, **When** alguém abre o endereço de edição dela, **Then** vê "Solução não encontrada".
8. **Given** uma pessoa que não é admin, **When** tenta excluir, **Then** o sistema recusa.

### Edge Cases

- **Excluir uma solução arquivada:** é permitido.
- **Duas pessoas excluindo ao mesmo tempo:** a segunda recebe "Solução não encontrada" e a lista se atualiza.
- **Cadastrar outra com o mesmo nome depois de excluir:** é permitido (nomes de solução não são únicos hoje).
- **Falha na exclusão:** a mensagem de erro aparece e a solução continua na lista.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A lista de soluções MUST oferecer, em cada linha, as ações Editar, Arquivar/Restaurar e Excluir.
- **FR-002**: Excluir MUST pedir confirmação explícita. A confirmação mostra:
  - o nome da solução;
  - o aviso de que não dá para desfazer pela tela;
  - as soluções relacionadas, dizendo que elas continuam no Hub e só perdem a ligação.
- **FR-002a**: Excluir MUST afetar só a solução escolhida. Nenhuma outra solução é excluída, arquivada ou alterada, exceto pela perda da ligação com a excluída. Grupos, pessoas e categorias também não mudam.
- **FR-003**: Após a exclusão, a solução MUST sumir da lista, do globo, da busca, do painel e das relacionadas de todas as outras soluções, para todas as pessoas.
- **FR-004**: Após a exclusão, a solução MUST deixar de existir para a API: consultar, editar, arquivar ou excluir de novo responde "Solução não encontrada".
- **FR-005**: Somente admins MUST poder excluir. A regra vale também quando a tela é contornada.
- **FR-006**: A exclusão MUST manter o registro guardado internamente com a data da exclusão, para auditoria. Ele não aparece em nenhuma tela.

### Key Entities

- **Solução**: ganha a marcação de "excluída em" (data). Uma solução excluída não aparece para ninguém e não pode ser restaurada pela tela.

## Success Criteria *(mandatory)*

- **SC-001**: Um admin exclui uma solução em até 3 cliques (Excluir → Confirmar), com a lista atualizada logo em seguida.
- **SC-002**: 0 soluções excluídas visíveis em qualquer tela, para qualquer pessoa, nos testes automáticos.
- **SC-003**: Cancelar a confirmação nunca altera dados.
- **SC-004**: Nos testes automáticos, depois de excluir uma solução com relacionadas, o total de soluções cai exatamente 1 e cada relacionada continua igual, sem a ligação removida.

## Assumptions

- **Arquivar continua existindo.** Arquivar é temporário e reversível (a solução fica na lista como "Arquivada"). Excluir é para cadastro errado ou duplicado e tira a solução da lista. A Governança das Políticas segue usando o arquivamento na revisão semestral.
- **Exclusão guardada internamente (não apagada de vez).**
  - Decisão: marcar a data da exclusão em vez de apagar o registro.
  - Por quê: é a regra de banco do projeto, que exige exclusão lógica. Isso permite auditar o que foi removido. As ligações da solução (grupos, acesso, relacionadas) são removidas para não vazar acesso.
- **Sem lixeira na tela.** Restaurar uma solução excluída fica fora deste escopo. Se precisar, é um pedido futuro.
- **Editar** já existe (spec 001) e não muda.
