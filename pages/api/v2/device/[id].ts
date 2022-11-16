import { configs } from "@etherdata-blockchain/common";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { dbServices } from "@etherdata-blockchain/services";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

interface Data {}

/**
 * @swagger
 * /api/v2/owner:
 *   name: Get owner owns devices
 *   get:
 *     summary: Get owner owns devices
 *     tags: ["Owner"]
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: "object"
 *       404:
 *         description: Not found
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { id } = req.query;
  const service = new dbServices.StorageManagementService();
  const client = await service.getDeviceByID(id as string);
  const data = client.toJSON();

  if (data.deviceStatus !== null) {
    data.deviceStatus.isOnline = client.deviceStatus?.isOnline ?? false;
  }
  res.status(StatusCodes.OK).json(data);
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
