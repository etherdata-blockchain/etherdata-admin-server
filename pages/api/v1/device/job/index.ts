import type { NextApiRequest, NextApiResponse } from "next";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { configs, enums, interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Data = interfaces.PaginationResult<schema.IPendingJob<enums.AnyValueType>>;

/**
 * @swagger
 * /api/v1/device/job:
 *   name: Get list of jobs
 *   get:
 *     tags: ["Job"]
 *     description: Returns a list of pending jobs
 *     summary: Get a list of jobs
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
 *                      $ref: "#/definitions/PendingJob"
 *       404:
 *         description: No device owned by the given user
 *       401:
 *         description: The given user is not authenticated
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const pendingJobService = new dbServices.PendingJobService();
  const results = await pendingJobService.list(
    configs.Configurations.defaultPaginationStartingPage,
    configs.Configurations.numberPerPage
  );

  if (results) {
    res.status(StatusCodes.OK).json(results);
  } else {
    res.status(StatusCodes.NOT_FOUND);
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
]);
