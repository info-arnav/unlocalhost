import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { DeviceController } from './device.controller.js';

export function createDeviceRouter(
  controller: DeviceController,
  sessionAuth: RequestHandler,
): Router {
  const router = Router();

  router.post('/device/start', controller.start);
  router.post('/device/poll', controller.poll);
  router.post('/device/approve', sessionAuth, controller.approve);

  return router;
}
