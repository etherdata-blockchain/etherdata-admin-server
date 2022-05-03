import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { configs } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { jwtVerificationHandler } from "@etherdata-blockchain/next-js-handlers";

/**
 * @swagger
 * /api/v1/device/get/by_user:
 *   name: Get devices by user
 *   get:
 *     tags: ["Device"]
 *     description: Returns a list of devices by authenticated user
 *     summary: Get owned devices
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
 *           type: "object"
 *           properties:
 *             count:
 *                 type: number
 *                 description: total number of objects
 *
 *             totalPage:
 *                 type: number
 *                 description: total number of page
 *
 *             currentPage:
 *                 type: number
 *                 description: current page number
 *
 *             pageSize:
 *                 type: number
 *                 description: number of items per page
 *
 *             results:
 *                 type: array
 *                 items:
 *                      $ref: "#/definitions/StorageItemDBInterface"
 *       404:
 *         description: No device owned by the given user
 *       401:
 *         description: The given user is not authenticated
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user, page } = req.query;

  const storagePlugin = new dbServices.StorageManagementService();

  const pageNum = parseInt(
    (page ??
      configs.Configurations.defaultPaginationStartingPage.toString()) as string
  );
  const storageItems = await storagePlugin.getDevicesByUser(
    pageNum,
    (user === "null" ? null : user) as any
  );

  if (storageItems === undefined) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  res.status(StatusCodes.OK).json(storageItems);
}

export default jwtVerificationHandler(handler as any);
