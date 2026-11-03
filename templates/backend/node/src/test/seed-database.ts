import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { env } from '../config/env.js';

const SEED_FILE = new URL('../../seeds/20261015120000_hub_prototipo.sql', import.meta.url);

const TABLES = [
  'solution_access_users',
  'solution_access_groups',
  'solution_related',
  'solution_groups',
  'solutions',
  'categories',
  'group_members',
  'groups',
  'users',
];

// Só para testes de integração: zera o banco de TESTE e aplica o seed do protótipo.
export const resetAndSeed = async () => {
  if (env.NODE_ENV !== 'test') throw new Error('resetAndSeed só roda com NODE_ENV=test');

  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`TRUNCATE ${TABLES.join(', ')} CASCADE`);
    await client.query(await readFile(SEED_FILE, 'utf8'));
  } finally {
    await client.end();
  }
};

// IDs fixos do seed (comentados no arquivo SQL com o id do protótipo).
const id = (suffix: number) => `0199e800-0000-7000-8000-000000000${suffix}`;

export const SEED = {
  users: {
    marina: id(101),
    rafael: id(102),
    juliana: id(103),
    diego: id(104),
    camila: id(105),
    tiago: id(106),
  },
  groups: {
    comercial: id(201),
    financeiro: id(202),
    marketing: id(203),
    operacao: id(204),
    dadosBi: id(205),
    pessoas: id(206),
    dirComercial: id(207),
    dirAdmFinanceira: id(208),
    dirTecnologia: id(209),
  },
  categories: { microSaas: id(301) },
  solutions: {
    s1: id(401),
    s2: id(402),
    s3: id(403),
    s4: id(404),
    s5: id(405),
    s6: id(406),
    s7: id(407),
    s8: id(408),
    s9: id(409),
    s10: id(410),
    s11: id(411),
  },
} as const;

export const asUser = (userId: string) => ({ 'x-hub-user': userId });
