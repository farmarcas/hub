# Feature Specification: Hospedagem no Coolify da Farmarcas

**Feature Branch**: `005-hospedagem-coolify`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Preparar o Hub de Inovação para hospedagem no Coolify da Farmarcas: imagem de produção da tela (build + nginx com proxy /api e /health), docker-compose de produção sem bind mounts nem portas publicadas, migrations rodando no boot, variáveis de ambiente documentadas e guia de deploy no Coolify."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar o Hub no Coolify com poucos passos (Priority: P1)

Quem cuida da plataforma na Farmarcas conecta o repositório ao Coolify, preenche as variáveis indicadas no guia e clica em publicar. O Hub (tela, API e banco) sobe sozinho, com o banco já preparado, e fica acessível pelo endereço configurado, com HTTPS.

**Why this priority**: sem isso o Hub não existe fora da máquina de quem desenvolve; é o objetivo da funcionalidade.

**Independent Test**: seguir apenas o guia, numa aplicação nova do Coolify, e abrir o endereço do Hub no navegador vendo o catálogo carregado.

**Acceptance Scenarios**:

1. **Given** um Coolify com o repositório conectado e as variáveis preenchidas, **When** a pessoa publica, **Then** os três serviços ficam saudáveis e o Hub abre no endereço configurado.
2. **Given** um banco novo e vazio, **When** o Hub sobe pela primeira vez, **Then** a estrutura do banco é criada automaticamente, sem passo manual.
3. **Given** uma variável obrigatória faltando (ex.: senha do banco), **When** a pessoa publica, **Then** a publicação falha cedo, com mensagem dizendo qual variável falta.

---

### User Story 2 - Atualizar o Hub sem perder dados (Priority: P1)

Quando há uma versão nova, a pessoa publica de novo no Coolify. A tela e a API são trocadas, mudanças na estrutura do banco são aplicadas e os dados já cadastrados permanecem.

**Why this priority**: o Hub guarda soluções e cadastros reais; perder dados a cada atualização inviabiliza o uso.

**Independent Test**: cadastrar uma solução, publicar uma nova versão e conferir que a solução continua lá.

**Acceptance Scenarios**:

1. **Given** um Hub no ar com dados, **When** uma nova versão é publicada, **Then** os dados continuam disponíveis.
2. **Given** uma atualização com mudança na estrutura do banco, **When** o Hub reinicia, **Then** a mudança é aplicada antes de a API aceitar pedidos.
3. **Given** a API não consegue concluir a atualização do banco, **When** o Hub tenta subir, **Then** a versão nova não entra no ar e a versão anterior continua atendendo.

---

### User Story 3 - Saber se o Hub está saudável (Priority: P2)

O Coolify mostra se o Hub está saudável e reinicia sozinho o que travar, sem expor o banco para fora.

**Why this priority**: operação previsível, mas o Hub já funciona sem isso.

**Independent Test**: parar a API manualmente e ver o Coolify marcá-la como não saudável e reiniciá-la.

**Acceptance Scenarios**:

1. **Given** o Hub no ar, **When** a API para de responder, **Then** o Coolify a identifica como não saudável.
2. **Given** o Hub no ar, **When** alguém tenta conectar ao banco de fora do Coolify, **Then** a conexão não é possível.

---

### Edge Cases

- O banco demora a ficar pronto: a API espera, sem derrubar a publicação à toa.
- O volume de dados do banco é recriado por engano: o guia avisa que isso apaga os dados e como fazer cópia antes.
- O endereço do Hub muda: só a configuração do Coolify precisa mudar, não o código.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Hub MUST poder ser publicado no Coolify a partir do repositório, sem instalar nada à mão no servidor.
- **FR-002**: A tela MUST ser entregue já pronta para uso (não em modo de desenvolvimento) e MUST encaminhar os pedidos da API e de saúde para a API sob o mesmo endereço.
- **FR-003**: A estrutura do banco MUST ser criada e atualizada automaticamente a cada publicação, antes da API atender pedidos.
- **FR-004**: Os dados do banco MUST persistir entre publicações.
- **FR-005**: O banco MUST ficar acessível apenas pelos outros serviços do Hub, nunca de fora.
- **FR-006**: Nenhuma senha ou segredo MUST ficar no repositório; todos vêm de variáveis do Coolify.
- **FR-007**: A publicação MUST falhar com mensagem clara se faltar uma variável obrigatória.
- **FR-008**: Cada serviço MUST informar sua saúde para o Coolify acompanhar.
- **FR-009**: O ambiente local de desenvolvimento MUST continuar funcionando como hoje.
- **FR-010**: MUST existir um guia curto, em linguagem simples, com os passos no Coolify, a lista de variáveis e como fazer cópia de segurança e voltar uma versão.
- **FR-011**: O Hub MUST ficar acessível pela internet (decisão da pessoa solicitante), com HTTPS.
- **FR-012**: Nesta publicação NÃO haverá login real: continua o "Entrar como" simulado já existente. O guia MUST avisar que, estando aberto na internet, qualquer visitante pode escolher entrar como qualquer pessoa, inclusive administradora.

### Key Entities

- **Ambiente de produção**: conjunto tela + API + banco publicado no Coolify, com endereço, variáveis e dados próprios.
- **Variável de configuração**: valor definido no Coolify (senhas, endereço, modo de identificação), documentado no guia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa sem conhecimento técnico profundo, seguindo o guia, publica o Hub em menos de 30 minutos.
- **SC-002**: Após a publicação, o Hub abre e mostra o catálogo em menos de 5 segundos.
- **SC-003**: 100% dos dados cadastrados permanecem após uma nova publicação.
- **SC-004**: Zero segredos no repositório.
- **SC-005**: O ambiente local continua subindo com um único comando.

## Assumptions

- Decision: o banco roda como serviço dentro do mesmo conjunto no Coolify, com volume persistente. Why: é o padrão do projeto e não depende de outro banco.
- Decision: um arquivo de composição próprio para produção, separado do local. Why: o local usa código montado e portas abertas só para desenvolvimento.
- Decision: a tela é servida por um servidor web leve que também encaminha a API. Why: o navegador fala com um só endereço, sem problemas de CORS.
- Decision: as atualizações do banco rodam em uma etapa antes da API subir. Why: evita duas cópias da API mexendo no banco ao mesmo tempo.
- O domínio será configurado no Coolify; o código não o conhece.
- Risco aceito pela pessoa solicitante: Hub aberto na internet sem login real. Recomendação registrada: proteger com senha de acesso do Coolify ou restringir por rede até existir o login do Radar.
- Fora de escopo: login real (Radar), backup automatizado, monitoramento além da saúde dos serviços.
