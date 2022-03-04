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
  | interfaces.PaginationResult<schema.IInstallationTemplate>
  | Buffer;

/**
 * @swagger
 * /api/v1/installation-template:
 *   get:
 *     tags: ["Installation Template"]
 *     description: List all installation templates
 *     summary: List all installation templates
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
 *                      $ref: "#/definitions/InstallationTemplateDBInterface"
 *   post:
 *      tags: ["Installation Template"]
 *      description: Create a new installation template
 *      summary: Create a new installation template
 *      parameters:
 *        - name: data
 *          type: object
 *          in: body
 *          schema:
 *            $ref: "#/definitions/InstallationTemplateDBInterface"
 *      responses:
 *        200:
 *          description: ok
 *          schema:
 *            type: object
 *            $ref: "#/definitions/InstallationTemplateDBInterface"
 *
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const installationService = new dbServices.InstallationService();

  /**
   * Will list templates by page number and page size
   */
  const handleListRequest = async () => {
    const { page, pageSize } = req.body;
    const results = await installationService.list(page, pageSize);
    res.status(StatusCodes.OK).json(results!);
  };

  /**
   * Will create a template by user. Will automatically add user
   */
  const handlePostRequest = async () => {
    const { user } = req.body;

    const data = {
      ...req.body,
      created_by: user,
    };
    const result = await installationService.createWithValidation(data, {
      upsert: false,
    });
    if (!result) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "image is not in docker image collection" });
      return;
    }
    res.status(StatusCodes.CREATED).json({ message: "OK" });
  };

  switch (req.method) {
    case "GET":
      await handleListRequest();
      break;

    case "POST":
      await handlePostRequest();
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler as any)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
