import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { configs } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { jwtVerificationHandler } from "@etherdata-blockchain/next-js-handlers";

/**
 * @swagger
 * /api/v1/device/all:
 *   name: Get all devices
 *   get:
 *     tags: ["Device"]
 *     description: Returns a list of devices in the database
 *     summary: Get all devices
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
 *       401:
 *         description: The given user is not authenticated
 *       500:
 *         description: Database error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page } = req.query;

  const storagePlugin = new dbServices.StorageManagementService();

  const pageNum = parseInt(
    (page ??
      configs.Configurations.defaultPaginationStartingPage.toString()) as string
  );
  const storageItems = await storagePlugin.list(
    pageNum,
    configs.Configurations.numberPerPage
  );

  if (storageItems === undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    return;
  }

  res.status(StatusCodes.OK).json(storageItems);
}

export default jwtVerificationHandler(handler as any);
