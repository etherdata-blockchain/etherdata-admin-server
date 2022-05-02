import type { NextApiRequest, NextApiResponse } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { interfaces, utils } from "@etherdata-blockchain/common";

type Data =
  | {
      reason?: string;
    }
  | interfaces.PaginationResult<interfaces.db.StorageUserDBInterface>;

/**
 * @swagger
 * /api/v1/device/edit/owner:
 *   name: Create a new owner or get list of owners
 *   post:
 *     summary: Create a new owner
 *     tags: ["Device"]
 *     parameters:
 *       - name: Owner data
 *         in: body
 *         type: object
 *         required: true
 *         schema:
 *           $ref: "#/definitions/StorageUserDBInterface"
 *     responses:
 *        201:
 *          description: Created
 *        500:
 *          description: Internal server error
 *        400:
 *          description: Missing required info
 *        401:
 *          description: JWT token is invalid
 *        404:
 *          description: No such owner
 *   get:
 *     summary: Get owner's info
 *     tags: ["Device"]
 *     parameters:
 *       - name: page
 *         in: query
 *         type: number
 *         required: false
 *       - name: pageSize
 *         in: query
 *         type: number
 *         required: false
 *     responses:
 *       200:
 *         description: OK
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
 *                      $ref: "#/definitions/StorageUserDBInterface"
 *       404:
 *         description: Not found
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const service = new dbServices.StorageManagementOwnerService();

  const handleListRequest = async () => {
    const { page, pageSize } = req.body;
    const results = await service.list(page, pageSize);
    res.status(StatusCodes.OK).json(results!);
  };

  /**
   * Will create a template by user. Will automatically add user
   */
  const handlePostRequest = async () => {
    const data = req.body;
    if (data === undefined) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ reason: "Missing required data" });
      return;
    }
    await service.create(
      { _id: utils.newObjectId(), ...data },
      { upsert: true }
    );
    res.status(StatusCodes.CREATED).json({});
  };

  switch (req.method) {
    case HTTPMethod.GET:
      await handleListRequest();
      break;

    case HTTPMethod.POST:
      await handlePostRequest();
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler) as any),
  [HTTPMethod.POST, HTTPMethod.GET]
);
