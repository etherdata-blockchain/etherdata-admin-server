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
  const { page, id } = req.query;
  console.log(id);

  const currentPage = parseInt((page as string) ?? "1");
  const storagePlugin = new dbServices.StorageManagementService();
  const storageItems = await storagePlugin.getDevicesByUser(
    currentPage,
    (id === "null" ? null : id) as any
  );

  res.status(StatusCodes.OK).send(storageItems);
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
