# Publicar o Hub no Coolify

Guia curto. O Hub tem quatro peças no arquivo [docker-compose.prod.yml](../../docker-compose.prod.yml): `postgres` (banco), `migrate` (atualiza o banco e termina), `api` e `web` (a tela, que também encaminha a API). O ambiente local usa outro arquivo, o `docker-compose.yml`.

## Passo a passo

1. No Coolify, crie um **Novo recurso** → repositório do Hub → tipo de build **Docker Compose**.
2. Em **Docker Compose Location**, informe `/docker-compose.prod.yml`.
3. Em **Environment Variables**, preencha (modelo em [.env.production.example](../../.env.production.example)):

   | Variável | Obrigatória | Exemplo |
   | --- | --- | --- |
   | `POSTGRES_USER` | sim | `hub` |
   | `POSTGRES_PASSWORD` | sim | senha forte gerada (nunca `app`) |
   | `POSTGRES_DB` | sim | `hub` |
   | `AUTH_MODE` | não | `mock` (único modo hoje) |

   Se faltar uma obrigatória, a publicação para e a mensagem diz qual.
4. No serviço **web**, informe o domínio (ex.: `https://hub.seudominio.com.br`) **com a porta 8080** (`https://hub.seudominio.com.br:8080` na tela do Coolify; o endereço público continua sem porta). O Coolify cuida do HTTPS.
5. Não publique porta nenhuma dos outros serviços. O banco e a API só conversam dentro do conjunto.
6. Clique em **Deploy**. Na primeira vez as migrations criam as tabelas sozinhas.
7. Confira: `https://<seu domínio>/health/ready` deve responder `{"status":"ok"}` e a raiz deve abrir o catálogo.

## Atualizar

Publique de novo (ou ligue o deploy automático). A etapa `migrate` aplica mudanças no banco antes da API nova subir. Se ela falhar, a versão nova não entra e a anterior continua atendendo. Os dados ficam no volume `postgres_data` e não são apagados.

## Dados de exemplo (opcional, só para demonstração)

O banco nasce **vazio** e a lista do "Entrar como" vem de pessoas cadastradas; por isso, sem dados ninguém consegue entrar. Para uma demonstração, no terminal do serviço `api` no Coolify rode `npm run db:seed`. Os dados são **fictícios** (ver `backend/node/seeds/`) e não devem ir para um Hub de uso real.

> `npm run db:seed` usa o CLI do Prisma (disponível na imagem de produção). Se o terminal do Coolify não oferecer, rode o SQL do seed pelo `psql` do serviço `postgres`.

## ⚠ Segurança: Hub aberto na internet

Hoje o acesso é só o "Entrar como" simulado: a lista de pessoas é pública e qualquer visitante pode agir como qualquer pessoa, **inclusive administradora**. Até existir o login real (Radar), recomenda-se ligar a **senha de acesso (Basic Auth) do Coolify** ou restringir por rede/VPN.

## Cópia de segurança e volta de versão

- **Cópia do banco** (rode no terminal do serviço `postgres`): `pg_dump -U $POSTGRES_USER $POSTGRES_DB > /tmp/hub.sql` e copie o arquivo para fora. O Coolify também permite backups agendados do volume.
- **Voltar uma versão**: no Coolify, faça deploy de um commit anterior. Migrations já aplicadas não voltam sozinhas; mudanças de banco são sempre aditivas (expand/contract), então a versão anterior costuma continuar funcionando.
- **Nunca** apague o volume `postgres_data`: isso apaga todos os dados.

## Testar localmente antes

```bash
POSTGRES_USER=hub POSTGRES_PASSWORD=teste POSTGRES_DB=hub docker compose -p hubprod -f docker-compose.prod.yml up -d --build --wait
```
