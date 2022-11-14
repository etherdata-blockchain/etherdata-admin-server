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
  const { page, id } = req.query;

  const currentPage = parseInt((page as string) ?? "1");
  const storagePlugin = new dbServices.StorageManagementService();
  const storageItems = await storagePlugin.getDevicesByUser(
    currentPage,
    (id === "null" ? null : id) as any
  );

  const items = storageItems.results.map((item) => ({
    ...item.toJSON(),
    deviceStatus: undefined,
    lastSeen: item.deviceStatus.lastSeen,
    isOnline: item.deviceStatus.isOnline,
  }));

  res.status(StatusCodes.OK).json({ ...storageItems, results: items });
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
