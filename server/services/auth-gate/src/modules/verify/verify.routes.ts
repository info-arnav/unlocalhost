import { Router } from 'express';
import type { VerifyController } from './verify.controller.js';

export function createVerifyRouter(controller: VerifyController): Router {
  const router = Router();

  router.get('/verify', controller.verify);

  return router;
}
