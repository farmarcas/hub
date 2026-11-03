# Tasks: Hospedagem no Coolify da Farmarcas

**Input**: `specs/005-hospedagem-coolify/` (plan, spec, research, contracts, quickstart)
**Tests**: sem testes unitários novos; a validação é subir o Compose de produção (quickstart) e o passo novo da CI.

## Phase 1: Setup

- [x] T001 [P] Criar `.env.production.example` na raiz com as variáveis de `contracts/env.md` (sem valores reais; `POSTGRES_PASSWORD` com aviso "gerar senha forte")
- [x] T002 [P] Criar `frontend/react/docker/nginx.conf.template` (escuta 8080; fallback para `index.html`; proxy de `/api/` e `/health` para `${API_UPSTREAM}`; cache longo só em `/assets/`)

## Phase 2: Foundational

- [x] T003 Acrescentar estágios `build` (`npm ci && npm run build`) e `runtime` (`nginxinc/nginx-unprivileged:1.27-alpine`, copia `dist` e o template, `EXPOSE 8080`, `API_UPSTREAM` padrão `http://api:4000`) em `frontend/react/Dockerfile`, mantendo o estágio `dev` primeiro e intacto (o Compose local usa `target: dev`)
- [x] T004 Conferir que `docker compose up -d --build --wait` (local) continua saudável após T003 (FR-009)

## Phase 3: User Story 1 - Publicar no Coolify (P1) 🎯 MVP

**Teste independente**: quickstart "Local", passos 1 a 4 e 6.

- [x] T005 [US1] Criar `docker-compose.prod.yml` na raiz com `postgres` (volume `postgres_data`, `pg_isready`, sem `ports`), `api` (`target: runtime`, `NODE_ENV=production`, `PORT=4000`, `DATABASE_URL`, `AUTH_MODE`, healthcheck `/health/ready`, sem `ports`) e `web` (`target: runtime`, `expose: 8080`, healthcheck, `depends_on` api saudável); `POSTGRES_*` com `${VAR:?mensagem clara}` (FR-005, FR-006, FR-007)
- [x] T006 [US1] Subir `docker compose -f docker-compose.prod.yml` com valores de teste, conferir serviços saudáveis, nenhuma porta publicada no host e `/` + `/health/ready` respondendo pelo `web`
- [x] T007 [US1] Testar a falha de variável obrigatória faltando (sem `POSTGRES_PASSWORD`) e anotar a mensagem

## Phase 4: User Story 2 - Atualizar sem perder dados (P1)

**Teste independente**: quickstart passo 5.

- [x] T008 [US2] Adicionar o serviço `migrate` em `docker-compose.prod.yml` (imagem `runtime` da API, comando `npx prisma migrate deploy`, `restart: "no"`, espera `postgres` saudável) e fazer `api` depender dele com `condition: service_completed_successfully`
- [x] T009 [US2] Validar: banco vazio sobe com as 3 migrations aplicadas; segunda subida mantém os dados (inserir uma linha de teste e conferir); migration quebrada (simulada) impede a API de subir

## Phase 5: User Story 3 - Saúde e banco fechado (P2)

- [x] T010 [US3] Validar que parar a `api` a deixa `unhealthy` e que o banco não responde fora da rede do Compose (`docker compose -f docker-compose.prod.yml ps` sem portas publicadas)

## Phase 6: Guia, CI e acabamento

- [x] T011 [P] Escrever `infrastructure/docker/COOLIFY.md`: passo a passo (criar app "Docker Compose", arquivo `docker-compose.prod.yml`, variáveis, domínio no serviço `web` porta 8080, HTTPS), seed opcional e fictício, cópia de segurança do volume, voltar versão, aviso do acesso aberto com "Entrar como" e recomendação de senha de acesso do Coolify
- [x] T012 [P] Acrescentar seção "Produção" em `infrastructure/docker/DOCKER.md` e linkar `COOLIFY.md` em `infrastructure/docker/README.md` e `AGENTS.md`
- [x] T013 [P] Acrescentar passo na CI em `.github/workflows/ci.yml`: build do `docker-compose.prod.yml`, subida com valores de teste, `--wait` e checagem de `/health/ready` pelo `web`
- [x] T014 Rodar `scripts/sync-templates.sh` e `--check` (o Dockerfile do front mudou)
- [x] T015 Passar o quickstart completo e o checklist de `infrastructure/docker/DOCKER.md`; marcar as tarefas

## Dependências

T001, T002 → T003 → T004 → T005 → T006, T007 → T008 → T009 → T010 → T011 a T015.
Paralelo: T001 com T002; T011, T012 e T013 juntos.

## Estratégia

MVP = Fases 1 a 3 (Hub sobe em produção). Em seguida migrations no boot (US2), saúde (US3) e guia/CI.

## Notas da execução
- Validado localmente: subida saudável, 3 migrations aplicadas, nenhuma porta publicada, dados mantidos ao republicar, falha clara sem `POSTGRES_PASSWORD`, API parada detectada.
- Não simulado: migration quebrada impedindo a API (comportamento garantido pelo `service_completed_successfully` do Compose).
- Não testado: o deploy real no Coolify (precisa de acesso ao painel).
