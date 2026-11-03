import { Router } from 'express';
import { readViewer } from '../../shared/middlewares/identify.js';

export const meRouter = () => {
  const router = Router();

  router.get('/', (req, res) => {
    const { id, name, email, isAdmin } = readViewer(req);
    res.json({ id, name, email, isAdmin });
  });

  return router;
};
