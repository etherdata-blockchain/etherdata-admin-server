import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  jwtVerificationQueryHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";

/**
 * @swagger
 * /api/v1/device/get/id/by_user:
 *   name: Get device ids by user
 *   get:
 *     tags: ["Device"]
 *     description: Returns a list of device ids by authenticated user
 *     summary: Get owned device ids
 *     parameters:
 *       - name: user
 *         in: query
 *         type: string
 *         required: true
 *         description: JWT token of the storage user with structure like
 *
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           properties:
 *             ids:
 *                 type: array
 *                 description: Device ids
 *                 items:
 *                   type: string
 *       404:
 *         description: No device owned by the given user
 *       401:
 *         description: The given user is not authenticated
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.query;

  const storagePlugin = new dbServices.StorageManagementService();

  const storageItems = await storagePlugin.getDeviceIdsByUser(user as string);

  if (storageItems === undefined) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  res.status(StatusCodes.OK).json({ ids: storageItems });
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
]);
