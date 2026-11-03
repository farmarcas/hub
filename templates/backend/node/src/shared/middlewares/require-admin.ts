import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors/forbidden-error.js';
import { readViewer } from './identify.js';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!readViewer(req).isAdmin) throw new ForbiddenError();
  next();
};
