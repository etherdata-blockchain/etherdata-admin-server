import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { dbServices } from "@etherdata-blockchain/services";
import HTTPMethod from "http-method-enum";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/v2/device/status:
 *   name: Get Status of devices
 *   get:
 *     summary: Get Status of devices
 *     tags: ["Owner"]
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: "object"
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const deviceRegistrationService = new dbServices.DeviceRegistrationService();
  const storageService = new dbServices.StorageManagementService();

  const data = {
    onlineCount: await deviceRegistrationService.getOnlineDevicesCount(),
    totalCount: await storageService.count(),
  };

  res.status(200).json(data);
}

export default methodAllowedHandler(handler, [HTTPMethod.GET]);
