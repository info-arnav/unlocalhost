import { Router } from 'express';
import type { AppsController } from './apps.controller.js';

export function createAppsRouter(controller: AppsController): Router {
  const router = Router();

  router.get('/apps', controller.list);
  router.post('/apps', controller.create);
  router.get('/apps/:id', controller.get);
  router.post('/apps/:id/share', controller.share);
  router.post('/apps/:id/unshare', controller.unshare);

  return router;
}
