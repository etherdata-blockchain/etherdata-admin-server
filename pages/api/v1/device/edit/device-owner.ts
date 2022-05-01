import type { NextApiRequest, NextApiResponse } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";

type Data = {
  reason?: string;
};

/**
 * @swagger
 * /api/v1/device/edit/device-owner:
 *   name: Edit devices' owner by the given user
 *   post:
 *     summary: Edit devices' owner by the given user
 *     description: |
 *       This will update given devices' owner to the given user
 *       and will also unset all previous owned devices' owner field.
 *     tags: ["Device"]
 *     parameters:
 *       - name: data
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *               description: User id
 *             devices:
 *               description: List of device ids
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *        201:
 *          description: Created
 *        500:
 *          description: Internal server error
 *        400:
 *          description: Missing required info
 *        401:
 *          description: JWT token is invalid
 *
 *
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, devices } = req.body;

  if (user === undefined || devices === undefined) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ reason: "Missing required parameter" });
    return;
  }

  const plugin = new dbServices.StorageManagementService();
  await plugin.unregisterDevicesByUser(user);
  await plugin.registerDevicesByUser(user, devices);
  res.status(StatusCodes.CREATED).json({});
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.POST,
]);
