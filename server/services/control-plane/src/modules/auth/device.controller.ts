import { badRequest } from '@unlocalhost/shared/error';
import type { NextFunction, Request, Response } from 'express';
import type { Config } from '../../config.js';
import { approveSchema, pollSchema } from './device.schema.js';
import type { DeviceService } from './device.service.js';
import type { TokenService } from './token.service.js';

export class DeviceController {
  constructor(
    private readonly config: Config,
    private readonly devices: DeviceService,
    private readonly tokens: TokenService,
  ) {}

  start = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const grant = await this.devices.start();
      const base = `${this.config.WEB_ORIGIN}/connect`;

      res.status(201).json({
        deviceCode: grant.deviceCode,
        userCode: grant.userCode,
        verificationUri: base,
        verificationUriComplete: `${base}?code=${grant.userCode}`,
        expiresIn: grant.expiresIn,
        interval: grant.interval,
      });
    } catch (error) {
      next(error);
    }
  };

  poll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = pollSchema.safeParse(req.body);

      if (!parsed.success) {
        next(badRequest('INVALID_BODY', 'deviceCode is required'));
        return;
      }

      const result = await this.devices.poll(parsed.data.deviceCode);

      if (result.status === 'pending') {
        res.status(202).json({ status: 'pending' });
        return;
      }

      if (result.status === 'expired') {
        res.status(410).json({ status: 'expired' });
        return;
      }

      res.status(200).json({
        status: 'approved',
        token: await this.tokens.issue(result.userId),
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = approveSchema.safeParse(req.body);

      if (!parsed.success) {
        next(badRequest('INVALID_BODY', 'userCode and userId are required'));
        return;
      }

      const approved = await this.devices.approve(
        parsed.data.userCode,
        parsed.data.userId,
      );

      if (!approved) {
        next(badRequest('INVALID_CODE', 'That code is invalid or expired'));
        return;
      }

      res.status(200).json({ status: 'approved' });
    } catch (error) {
      next(error);
    }
  };
}
