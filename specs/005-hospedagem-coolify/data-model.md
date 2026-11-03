# Data Model

Esta funcionalidade não cria nem altera tabelas. As migrations existentes (`init`, `hub_catalog`, `solution_soft_delete`) são aplicadas em produção por `prisma migrate deploy`. O volume `postgres_data` guarda os dados.
