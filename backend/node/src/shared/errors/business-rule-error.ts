import { AppError } from './app-error.js';

// Regra de negócio violada pela entrada (400 com código próprio, ex.: SOLUTION_REQUIRES_GROUP).
export class BusinessRuleError extends AppError {
  constructor(message: string, code: string, details: unknown[] = []) {
    super(message, 400, code, details);
  }
}
