import type { Viewer } from '../modules/access/access.service.js';

declare global {
  namespace Express {
    interface Locals {
      validated?: unknown;
    }

    interface Request {
      viewer?: Viewer;
    }
  }
}

export {};
