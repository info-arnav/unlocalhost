import { Router } from 'express';
import type { DeployController } from './deploy.controller.js';

export function createDeployRouter(controller: DeployController): Router {
  const router = Router();

  router.post('/deploy', controller.deploy);
  router.get('/apps/:id/logs', controller.logs);

  return router;
}
