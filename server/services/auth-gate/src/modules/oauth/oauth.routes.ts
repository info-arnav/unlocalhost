import { Router } from 'express';
import type { OAuthController } from './oauth.controller.js';

export function createOAuthRouter(controller: OAuthController): Router {
  const router = Router();

  router.get('/login/:provider', controller.authorize);
  router.get('/auth/callback/github-app', controller.install);
  router.get('/auth/callback/:provider', controller.callback);
  router.get('/logout', controller.logout);

  return router;
}
