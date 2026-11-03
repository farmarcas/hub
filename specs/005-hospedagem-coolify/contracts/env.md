# Contrato: variáveis de ambiente de produção

Definidas no painel do Coolify (nunca no git). Modelo em `.env.production.example`.

| Variável | Obrigatória | Serviço | Exemplo/padrão | Observação |
| --- | --- | --- | --- | --- |
| `POSTGRES_USER` | sim | postgres, migrate, api | `hub` | |
| `POSTGRES_PASSWORD` | sim | postgres, migrate, api | (gerar forte) | nunca `app` |
| `POSTGRES_DB` | sim | postgres, migrate, api | `hub` | |
| `AUTH_MODE` | não | api | `mock` | único modo hoje |
| `API_UPSTREAM` | não | web | `http://api:4000` | |

Portas: nenhuma publicada. Domínio: configurado no serviço `web` no Coolify, apontando para a porta 8080.

Endpoints expostos ao público (todos pelo domínio da `web`): `/` (tela), `/api/v1/*`, `/health`, `/health/ready`. Contrato HTTP da API inalterado.
