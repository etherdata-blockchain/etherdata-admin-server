import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";

/**
 * @swagger
 * /api/v1/static-node:
 *   name: Static node operation
 *   get:
 *     tags: ["Static Node"]
 *     description: List all the static nodes
 *     summary: List all static nodes
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
 *                      $ref: "#/definitions/StaticNodeDBInterface"
 *   post:
 *      tags: ["Static Node"]
 *      description: Create a new static node
 *      summary: Create a new static node
 *      parameters:
 *        - name: data
 *          type: object
 *          in: body
 *          schema:
 *            $ref: "#/definitions/StaticNodeDBInterface"
 *      responses:
 *        200:
 *          description: ok
 *          schema:
 *            type: object
 *            $ref: "#/definitions/StaticNodeDBInterface"
 *
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staticNodeService = new dbServices.StaticNodeService();
  switch (req.method) {
    case "GET":
      const { page, pageSize } = req.body;
      const result = await staticNodeService.list(page, pageSize);
      res.status(StatusCodes.OK).json(result);
      break;
    case "POST":
      await staticNodeService.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler as any)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
