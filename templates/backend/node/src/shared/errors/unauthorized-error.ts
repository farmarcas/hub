import { AppError } from './app-error.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'Identifique-se para continuar', code = 'UNAUTHENTICATED') {
    super(message, 401, code);
  }
}
