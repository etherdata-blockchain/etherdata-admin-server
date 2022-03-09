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
 * /api/v1/device/search:
 *   name: Search devices by key
 *   get:
 *     tags: ["Device"]
 *     description: Returns a list of devices by key
 *     summary: Search devices by key
 *     parameters:
 *       - name: user
 *         in: query
 *         type: string
 *         required: true
 *         description: JWT token of the storage user with structure like
 *       - name: page
 *         in: query
 *         type: number
 *         required: false
 *         description: page number
 *
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "array"
 *           items:
 *             $ref: "#/definitions/StorageItemDBInterface"
 *       404:
 *         description: No devices with the given key found
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;
  const storageManagementService = new dbServices.StorageManagementService();
  const devices = await storageManagementService.search(key as string);

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
