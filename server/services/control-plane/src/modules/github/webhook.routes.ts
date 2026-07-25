import express, { Router } from 'express';
import type { WebhookController } from './webhook.controller.js';

export function createWebhookRouter(controller: WebhookController): Router {
  const router = Router();

  router.post(
    '/webhooks/github',
    express.raw({ type: 'application/json', limit: '5mb' }),
    controller.github,
  );

  return router;
}
