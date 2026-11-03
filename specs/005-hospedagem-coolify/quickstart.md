# Quickstart: validar a hospedagem

## Local (antes de ir ao Coolify)
1. `docker compose -f docker-compose.prod.yml --env-file .env.production.example up -d --build --wait` (usando valores de teste).
2. `docker compose -f docker-compose.prod.yml ps`: `postgres`, `api`, `web` saudáveis; `migrate` encerrado com sucesso.
3. Conferir que nenhuma porta está publicada no host (`docker compose ... ps` sem `->`).
4. Pela tela (dentro da rede do Compose): `GET /health/ready` responde 200 e `/` entrega o HTML.
5. Rodar o passo de novo: dados mantidos (US2); apagar a variável `POSTGRES_PASSWORD` e ver a falha com mensagem (FR-007).
6. `docker compose up -d --build --wait` (local) continua funcionando (FR-009).

## No Coolify
Seguir `infrastructure/docker/COOLIFY.md`: abrir o domínio, ver `/health/ready` e o catálogo.
