-- Dados de exemplo do protótipo "Hub de Inovacao v5" (somente local/dev).
-- Pessoas e endereços são fictícios. Idempotente: pode rodar mais de uma vez.
-- UUIDs fixos no formato UUIDv7, com o id do protótipo comentado ao lado.
-- Aplicar: docker compose exec api npm run db:seed
BEGIN;

INSERT INTO users (id, name, email, is_admin, updated_at) VALUES
  ('0199e800-0000-7000-8000-000000000101', 'Marina Freitas', 'marina.freitas@farmarcas.com.br', true, now()), -- u1
  ('0199e800-0000-7000-8000-000000000102', 'Rafael Prado', 'rafael.prado@farmarcas.com.br', false, now()), -- u2
  ('0199e800-0000-7000-8000-000000000103', 'Juliana Sato', 'juliana.sato@farmarcas.com.br', false, now()), -- u3
  ('0199e800-0000-7000-8000-000000000104', 'Diego Almeida', 'diego.almeida@farmarcas.com.br', false, now()), -- u4
  ('0199e800-0000-7000-8000-000000000105', 'Camila Rocha', 'camila.rocha@farmarcas.com.br', false, now()), -- u5
  ('0199e800-0000-7000-8000-000000000106', 'Tiago Menezes', 'tiago.menezes@farmarcas.com.br', true, now()) -- u6
ON CONFLICT DO NOTHING;

INSERT INTO groups (id, type, name, description, updated_at) VALUES
  ('0199e800-0000-7000-8000-000000000201', 'theme', 'Comercial', 'Vendas, preço, carteira de clientes e performance comercial.', now()), -- g-com
  ('0199e800-0000-7000-8000-000000000202', 'theme', 'Financeiro', 'Caixa, faturamento e controle financeiro.', now()), -- g-fin
  ('0199e800-0000-7000-8000-000000000203', 'theme', 'Marketing', 'Campanhas, marcas e relacionamento com o cliente.', now()), -- g-mkt
  ('0199e800-0000-7000-8000-000000000204', 'theme', 'Operação', 'Pedidos, estoque, processos e suporte interno.', now()), -- g-ops
  ('0199e800-0000-7000-8000-000000000205', 'theme', 'Dados & BI', 'Relatórios, painéis e indicadores para decisão.', now()), -- g-bi
  ('0199e800-0000-7000-8000-000000000206', 'theme', 'Pessoas', 'Onboarding, políticas e atendimento ao colaborador.', now()), -- g-ppl
  ('0199e800-0000-7000-8000-000000000207', 'directorate', 'Dir. Comercial', 'Patrocina as soluções de vendas e trade.', now()), -- d-com
  ('0199e800-0000-7000-8000-000000000208', 'directorate', 'Dir. Adm. Financeira', 'Patrocina as soluções financeiras e de pessoas.', now()), -- d-adm
  ('0199e800-0000-7000-8000-000000000209', 'directorate', 'Dir. Tecnologia', 'Patrocina a infraestrutura, ERP e dados.', now()) -- d-tec
ON CONFLICT DO NOTHING;

INSERT INTO group_members (group_id, user_id) VALUES
  ('0199e800-0000-7000-8000-000000000207', '0199e800-0000-7000-8000-000000000101'),
  ('0199e800-0000-7000-8000-000000000209', '0199e800-0000-7000-8000-000000000101'),
  ('0199e800-0000-7000-8000-000000000208', '0199e800-0000-7000-8000-000000000102'),
  ('0199e800-0000-7000-8000-000000000207', '0199e800-0000-7000-8000-000000000103'),
  ('0199e800-0000-7000-8000-000000000203', '0199e800-0000-7000-8000-000000000103'),
  ('0199e800-0000-7000-8000-000000000207', '0199e800-0000-7000-8000-000000000104'),
  ('0199e800-0000-7000-8000-000000000208', '0199e800-0000-7000-8000-000000000105'),
  ('0199e800-0000-7000-8000-000000000209', '0199e800-0000-7000-8000-000000000106')
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name) VALUES
  ('0199e800-0000-7000-8000-000000000301', 'Micro SaaS'),
  ('0199e800-0000-7000-8000-000000000302', 'Ferramenta Interna'),
  ('0199e800-0000-7000-8000-000000000303', 'Relatório / BI'),
  ('0199e800-0000-7000-8000-000000000304', 'Documentação')
ON CONFLICT DO NOTHING;

INSERT INTO solutions (id, name, url, objective, description, category_id, status, access_all, updated_at) VALUES
  ('0199e800-0000-7000-8000-000000000401', 'Radar Pricing', 'https://pricing.farmarcas.internal', 'Dar ao comercial preço sugerido por SKU com base no mercado, reduzindo perda de margem.', 'Precificação e monitoramento de preços de mercado.', '0199e800-0000-7000-8000-000000000301', 'published', false, now()), -- s1
  ('0199e800-0000-7000-8000-000000000402', 'Radar CRM', 'https://crm.farmarcas.internal', 'Centralizar o relacionamento com farmácias associadas em um só lugar.', 'Carteira de clientes e histórico de relacionamento.', '0199e800-0000-7000-8000-000000000301', 'published', false, now()), -- s2
  ('0199e800-0000-7000-8000-000000000403', 'Radar Finanças', 'https://financas.farmarcas.internal', 'Dar visão diária do caixa sem depender de planilhas.', 'Fluxo de caixa, contas a pagar e a receber.', '0199e800-0000-7000-8000-000000000301', 'published', false, now()), -- s3
  ('0199e800-0000-7000-8000-000000000404', 'Radar Marketing', 'https://marketing.farmarcas.internal', 'Medir o retorno de cada campanha por marca e região.', 'Campanhas, verba e desempenho por marca.', '0199e800-0000-7000-8000-000000000301', 'published', false, now()), -- s4
  ('0199e800-0000-7000-8000-000000000405', 'Radar E-commerce (Portal)', 'https://portal.farmarcas.internal', 'Permitir que associados façam pedidos online com catálogo atualizado.', 'Portal de pedidos e catálogo do e-commerce.', '0199e800-0000-7000-8000-000000000301', 'published', true, now()), -- s5
  ('0199e800-0000-7000-8000-000000000406', 'Órbita', 'https://orbita.farmarcas.internal', 'Organizar sortimento e negociações com a indústria por ciclo.', 'Gestão de sortimento e planos de negociação.', '0199e800-0000-7000-8000-000000000301', 'published', false, now()), -- s6
  ('0199e800-0000-7000-8000-000000000407', 'Cosmos (ERP)', 'https://cosmos.farmarcas.internal', 'Ser a fonte única de cadastros, estoque e faturamento.', 'ERP corporativo — cadastros, estoque e faturamento.', '0199e800-0000-7000-8000-000000000302', 'published', false, now()), -- s7
  ('0199e800-0000-7000-8000-000000000408', 'Sonar', 'https://sonar.farmarcas.internal', 'Dar um canal único e rastreável para pedidos internos.', 'Central de tickets e solicitações internas.', '0199e800-0000-7000-8000-000000000302', 'published', true, now()), -- s8
  ('0199e800-0000-7000-8000-000000000409', 'Relatório de Vendas Mensal', 'https://bi.farmarcas.internal/vendas-mensal', 'Padronizar o fechamento mensal de vendas para toda a diretoria.', 'Fechamento mensal de vendas por região e marca.', '0199e800-0000-7000-8000-000000000303', 'published', false, now()), -- s9
  ('0199e800-0000-7000-8000-000000000410', 'Painel de Indicadores Comerciais', 'https://bi.farmarcas.internal/indicadores', 'Acompanhar meta, cobertura e mix em tempo quase real.', 'Indicadores de meta, cobertura e mix.', '0199e800-0000-7000-8000-000000000303', 'published', false, now()), -- s10
  ('0199e800-0000-7000-8000-000000000411', 'Manual de Onboarding', 'https://docs.farmarcas.internal/onboarding', 'Reduzir o tempo de ambientação de novos colaboradores.', 'Primeiros passos e políticas para novos colaboradores.', '0199e800-0000-7000-8000-000000000304', 'published', true, now()) -- s11
ON CONFLICT DO NOTHING;

INSERT INTO solution_groups (solution_id, group_id) VALUES
  ('0199e800-0000-7000-8000-000000000401', '0199e800-0000-7000-8000-000000000201'),
  ('0199e800-0000-7000-8000-000000000401', '0199e800-0000-7000-8000-000000000205'),
  ('0199e800-0000-7000-8000-000000000401', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000402', '0199e800-0000-7000-8000-000000000201'),
  ('0199e800-0000-7000-8000-000000000402', '0199e800-0000-7000-8000-000000000203'),
  ('0199e800-0000-7000-8000-000000000402', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000403', '0199e800-0000-7000-8000-000000000202'),
  ('0199e800-0000-7000-8000-000000000403', '0199e800-0000-7000-8000-000000000208'),
  ('0199e800-0000-7000-8000-000000000404', '0199e800-0000-7000-8000-000000000203'),
  ('0199e800-0000-7000-8000-000000000404', '0199e800-0000-7000-8000-000000000205'),
  ('0199e800-0000-7000-8000-000000000404', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000405', '0199e800-0000-7000-8000-000000000201'),
  ('0199e800-0000-7000-8000-000000000405', '0199e800-0000-7000-8000-000000000204'),
  ('0199e800-0000-7000-8000-000000000405', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000406', '0199e800-0000-7000-8000-000000000201'),
  ('0199e800-0000-7000-8000-000000000406', '0199e800-0000-7000-8000-000000000204'),
  ('0199e800-0000-7000-8000-000000000406', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000407', '0199e800-0000-7000-8000-000000000204'),
  ('0199e800-0000-7000-8000-000000000407', '0199e800-0000-7000-8000-000000000202'),
  ('0199e800-0000-7000-8000-000000000407', '0199e800-0000-7000-8000-000000000209'),
  ('0199e800-0000-7000-8000-000000000408', '0199e800-0000-7000-8000-000000000204'),
  ('0199e800-0000-7000-8000-000000000408', '0199e800-0000-7000-8000-000000000206'),
  ('0199e800-0000-7000-8000-000000000408', '0199e800-0000-7000-8000-000000000209'),
  ('0199e800-0000-7000-8000-000000000409', '0199e800-0000-7000-8000-000000000205'),
  ('0199e800-0000-7000-8000-000000000409', '0199e800-0000-7000-8000-000000000201'),
  ('0199e800-0000-7000-8000-000000000409', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000410', '0199e800-0000-7000-8000-000000000205'),
  ('0199e800-0000-7000-8000-000000000410', '0199e800-0000-7000-8000-000000000201'),
  ('0199e800-0000-7000-8000-000000000410', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000411', '0199e800-0000-7000-8000-000000000206'),
  ('0199e800-0000-7000-8000-000000000411', '0199e800-0000-7000-8000-000000000208')
ON CONFLICT DO NOTHING;

-- Relação simétrica: um par por linha, sempre com solution_a_id < solution_b_id.
INSERT INTO solution_related (solution_a_id, solution_b_id) VALUES
  ('0199e800-0000-7000-8000-000000000401', '0199e800-0000-7000-8000-000000000406'),
  ('0199e800-0000-7000-8000-000000000402', '0199e800-0000-7000-8000-000000000404'),
  ('0199e800-0000-7000-8000-000000000402', '0199e800-0000-7000-8000-000000000410'),
  ('0199e800-0000-7000-8000-000000000403', '0199e800-0000-7000-8000-000000000407'),
  ('0199e800-0000-7000-8000-000000000405', '0199e800-0000-7000-8000-000000000407'),
  ('0199e800-0000-7000-8000-000000000408', '0199e800-0000-7000-8000-000000000411'),
  ('0199e800-0000-7000-8000-000000000409', '0199e800-0000-7000-8000-000000000410')
ON CONFLICT DO NOTHING;

INSERT INTO solution_access_groups (solution_id, group_id) VALUES
  ('0199e800-0000-7000-8000-000000000401', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000402', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000403', '0199e800-0000-7000-8000-000000000208'),
  ('0199e800-0000-7000-8000-000000000404', '0199e800-0000-7000-8000-000000000203'),
  ('0199e800-0000-7000-8000-000000000406', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000406', '0199e800-0000-7000-8000-000000000209'),
  ('0199e800-0000-7000-8000-000000000407', '0199e800-0000-7000-8000-000000000209'),
  ('0199e800-0000-7000-8000-000000000407', '0199e800-0000-7000-8000-000000000208'),
  ('0199e800-0000-7000-8000-000000000409', '0199e800-0000-7000-8000-000000000207'),
  ('0199e800-0000-7000-8000-000000000410', '0199e800-0000-7000-8000-000000000207')
ON CONFLICT DO NOTHING;

INSERT INTO solution_access_users (solution_id, user_id) VALUES
  ('0199e800-0000-7000-8000-000000000409', '0199e800-0000-7000-8000-000000000102') -- s9 → Rafael Prado
ON CONFLICT DO NOTHING;

COMMIT;
