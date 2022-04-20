import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IUpdateTemplate>
  | schema.IUpdateTemplate;

/**
 * @swagger
 * /api/v1/update-template:
 *   name: Update template
 *   get:
 *     tags: ["Update Template"]
 *     description: List all the update template
 *     summary: List all update template
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
 *   post:
 *      tags: ["Update Template"]
 *      description: Create a new update template
 *      summary: Create a new update template
 *      parameters:
 *        - name: data
 *          type: object
 *          in: body
 *      responses:
 *        200:
 *          description: ok
 *          schema:
 *            type: object
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const updateTemplateService = new dbServices.UpdateTemplateService();
  switch (req.method) {
    case HTTPMethod.POST:
      await updateTemplateService.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
    case HTTPMethod.GET:
      const { page, pageSize } = req.body;
      const result = await updateTemplateService.list(page, pageSize);
      res.status(StatusCodes.OK).json(result!);
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler as any)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
