# Implementation Plan: Hospedagem no Coolify da Farmarcas

**Branch**: `005-hospedagem-coolify` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md)

## Summary

Criar o caminho de produção ao lado do ambiente local: imagem de produção da tela (build do Vite servido por nginx, com proxy de `/api` e `/health` para a API), `docker-compose.prod.yml` sem bind mounts nem portas publicadas, etapa `migrate` que roda `prisma migrate deploy` antes da API, variáveis documentadas e guia de deploy no Coolify. O Compose local não muda.

## For the reader

Chosen: um segundo arquivo de composição só para produção, com a tela pronta (não em modo desenvolvimento) e o banco atualizado antes da API subir.

Why: o arquivo local continua igual para quem desenvolve, e o Coolify recebe algo que se publica sem ajustes manuais.

## Technical Context

**Language/Version**: Node 22 (API, TypeScript), React + Vite (tela), nginx-unprivileged 1.27-alpine, porta 8080 (servir a tela)
**Primary Dependencies**: Prisma Migrate (já usado), Docker Compose, Coolify (build pack "Docker Compose")
**Storage**: PostgreSQL 16 (`postgres:16-alpine`), volume nomeado
**Testing**: CI existente (`docker compose up --wait` + integração) + novo passo que sobe o `docker-compose.prod.yml` e checa `/health/ready` pela tela
**Target Platform**: Coolify da Farmarcas (Traefik faz domínio e HTTPS)
**Project Type**: web (frontend + backend)
**Performance Goals**: catálogo abre em menos de 5 s (SC-002)
**Constraints**: nenhuma porta publicada; nenhum segredo no git; ambiente local intacto
**Scale/Scope**: uso interno da Farmarcas, um único servidor

## Constitution Check

| Princípio | Situação |
| --- | --- |
| I Spec Kit | Seguido (spec → plan → tasks → implement) |
| II Tudo no Docker | OK; local inalterado |
| III Stack padrão | OK; nginx é acréscimo justificado em `research.md` (servir arquivos estáticos) |
| IV Banco só por migration | OK; produção só roda `migrate deploy`, nunca `reset` |
| V Dados protegidos | OK; guia avisa sobre volume e backup; nada destrutivo |
| VI Linguagem simples | OK; guia em português simples |
| VII Começar pequeno | OK; sem backup automático nem login real |
| VIII Agente decide o técnico | OK |

Nota sobre II: "portas só em 127.0.0.1" vale para o local. Em produção não se publica porta alguma; o Coolify entra pela rede interna dele. Sem violação.

Reavaliado após o desenho: sem violações.

## Riscos registrados

- **Hub aberto na internet com "Entrar como" simulado** (decisão da pessoa solicitante): a lista de pessoas é pública e qualquer visitante pode agir como administrador. Registrado no guia, com recomendação de senha de acesso do Coolify até existir login real.
- **Banco de produção nasce vazio e as pessoas só existem pelo seed de exemplo** (pessoas fictícias): ver `research.md` item 5.

## Project Structure

### Documentation (this feature)

```text
specs/005-hospedagem-coolify/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/env.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
docker-compose.prod.yml          # novo: postgres, migrate, api, web
.env.production.example          # novo: variáveis de produção (sem valores reais)
frontend/react/
├── Dockerfile                   # + estágios build e runtime (nginx); dev intacto
└── docker/nginx.conf.template   # novo: estático + proxy /api e /health
backend/node/Dockerfile          # sem mudança prevista (runtime já existe)
infrastructure/docker/
├── DOCKER.md                    # + seção Produção
└── COOLIFY.md                   # novo: guia de deploy
.github/workflows/ci.yml         # + passo: subir prod compose e checar saúde
scripts/sync-templates.sh        # incluir os arquivos novos nos templates, se aplicável
```

**Structure Decision**: arquivos de produção ao lado dos locais, sem tocar no fluxo de desenvolvimento.
