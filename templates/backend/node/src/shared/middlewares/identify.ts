import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../errors/unauthorized-error.js';
import type { IdentitiesRepository } from '../../modules/identities/identities.repository.js';
import type { Viewer } from '../../modules/access/access.service.js';

export const VIEWER_HEADER = 'x-hub-user';

const viewerIdSchema = z.string().uuid();

// AUTH_MODE=mock: a pessoa vem do cabeçalho x-hub-user e é sempre conferida no banco.
export const identify =
  (repo: Pick<IdentitiesRepository, 'findViewer'>) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const parsed = viewerIdSchema.safeParse(req.header(VIEWER_HEADER));
    if (!parsed.success) throw new UnauthorizedError();

    const viewer = await repo.findViewer(parsed.data);
    if (!viewer) throw new UnauthorizedError();

    req.viewer = viewer;
    next();
  };

export const readViewer = (req: Request): Viewer => {
  if (!req.viewer) throw new UnauthorizedError();
  return req.viewer;
};
