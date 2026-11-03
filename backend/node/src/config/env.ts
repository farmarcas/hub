import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  // Identificação simulada ("Entrar como") até a integração com o Radar.
  // Só existe o modo mock: qualquer outro valor impede a API de subir.
  AUTH_MODE: z.enum(['mock']).default('mock'),
});

export const env = envSchema.parse(process.env);
