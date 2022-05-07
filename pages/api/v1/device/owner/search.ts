import type { NextApiRequest, NextApiResponse } from "next";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

/**
 * @swagger
 * /api/v1/device/owner/search:
 *   name: Search owner by key
 *   get:
 *     tags: ["Device"]
 *     description: Returns a list of owners by key
 *     summary: Search owner by key
 *     parameters:
 *       - name: key
 *         in: query
 *         type: string
 *         required: true
 *         description: Search key
 *
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "array"
 *           items:
 *             $ref: "#/definitions/StorageUserDBInterface"
 *       404:
 *         description: No owner with the given key found
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;
  const storageManagementOwnerService =
    new dbServices.StorageManagementOwnerService();
  const devices = await storageManagementOwnerService.search(key as string);

  if (devices) {
    res.status(StatusCodes.OK).json(devices);
  } else {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ reason: `No result for the given key ${key}` });
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
]);
