import { Router } from 'express';
import type { DeviceController } from './device.controller.js';

export function createDeviceRouter(controller: DeviceController): Router {
  const router = Router();

  router.post('/device/start', controller.start);
  router.post('/device/poll', controller.poll);
  router.post('/device/approve', controller.approve);

  return router;
}
