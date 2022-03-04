import type { NextApiRequest, NextApiResponse } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";

type Data = {
  success: boolean;
  reason?: string;
};

/**
 * @swagger
 * /api/v1/device/register:
 *   name: Register device with the given user
 *   get:
 *     tags: ["Device"]
 *     deprecated: true
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, device } = req.body;

  const plugin = new dbServices.DeviceRegistrationService();
  const [success, reason] = await plugin.register(device, user);
  if (success) {
    res.status(201).json({ success: success, reason: reason });
  } else {
    res.status(500).json({ success: success, reason: reason });
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.POST,
]);
