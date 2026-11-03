# Research: Hospedagem no Coolify

## 1. Build pack do Coolify
- Decision: "Docker Compose" apontando para `docker-compose.prod.yml`; domínio configurado na tela do Coolify no serviço `web` (porta 8080).
- Rationale: o repositório já é composto por três serviços; o Compose mantém tudo versionado.
- Alternatives: um aplicativo Coolify por serviço (mais cliques, variáveis duplicadas); Nixpacks (esconde a configuração).

## 2. Servir a tela
- Decision: estágio `build` (`npm ci && npm run build`) e estágio `runtime` com `nginx-unprivileged:1.27-alpine`; `nginx.conf.template` com `API_UPSTREAM` (padrão `http://api:4000`), fallback para `index.html` e proxy de `/api` e `/health`.
- Rationale: o Vite só repassa `/api` em desenvolvimento; nginx mantém um endereço único e dispensa CORS (igual ao local).
- Alternatives: `vite preview` (não é para produção); domínio separado para a API (exige CORS e dois certificados).

## 3. Migrations no boot
- Decision: serviço `migrate` (imagem `runtime` da API, `npx prisma migrate deploy`, `restart: "no"`); `api` usa `depends_on: migrate: condition: service_completed_successfully`.
- Rationale: uma só execução por publicação; se falhar, a versão nova não sobe e a anterior segue atendendo (US2-3). A imagem runtime já traz o Prisma CLI (está em `dependencies`) e `prisma.config.ts`.
- Alternatives: migrar dentro do `CMD` da API (corrida entre réplicas, sem falha isolada).

## 4. Rede, portas e segredos
- Decision: nenhum `ports:`; `expose` só em `web`. `POSTGRES_*` obrigatórios com `${VAR:?mensagem}`. Sem `.env` no repositório; valores no painel do Coolify. Volume `postgres_data` nomeado.
- Rationale: FR-005, FR-006, FR-007.

## 5. Dados iniciais (pessoas)
- Fato: as pessoas do "Entrar como" vêm só do seed `backend/node/seeds/...sql`, que é de exemplo ("somente local/dev", pessoas fictícias). Banco vazio = ninguém consegue entrar.
- Decision: o seed NÃO roda automaticamente em produção. O guia traz o comando manual opcional (`npm run db:seed` no terminal do Coolify) para a primeira demonstração, avisando que são dados fictícios. Cadastrar pessoas reais e o login real ficam fora desta entrega.
- Rationale: não semear dado fictício em produção sem a pessoa decidir.
- Alternatives: seed automático (risco de dado fictício em produção); criar admin por variável (muda o produto; fica para a etapa do login).

## 6. Saúde
- Decision: `postgres` com `pg_isready`; `api` com `/health/ready`; `web` com `wget` em `/health` (via proxy) ou na raiz. Imagens usam `wget` do alpine, já disponível.

## 7. Executar com usuário sem privilégio
- Decision: `nginxinc/nginx-unprivileged:1.27-alpine` na porta 8080 (sem root); `expose: 8080` e domínio do Coolify apontando para `:8080`.
- Rationale: segue o `USER node` da API.
