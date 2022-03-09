import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IDockerImage>
  | schema.IDockerImage;

/**
 * @swagger
 * /api/v1/docker:
 *   name: Docker images operation
 *   get:
 *     tags: ["Docker"]
 *     description: List all the docker images stored on this server
 *     summary: Get docker images
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
 *                      $ref: "#/definitions/DockerImageDBInterface"
 *   post:
 *      tags: ["Docker"]
 *      description: Create a new image
 *      summary: Create a new docker image
 *      parameters:
 *        - name: data
 *          type: object
 *          in: body
 *          schema:
 *            $ref: "#/definitions/DockerImageDBInterface"
 *      responses:
 *        200:
 *          description: ok
 *          schema:
 *            type: object
 *            $ref: "#/definitions/DockerImageDBInterface"
 *
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const dockerImageService = new dbServices.DockerImageService();
  switch (req.method) {
    case "POST":
      await dockerImageService.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
    case "GET":
      const { page, pageSize } = req.body;
      const result = await dockerImageService.list(page, pageSize);
      res.status(StatusCodes.OK).json(result!);
      break;
  }
}

export default jwtVerificationHandler(paginationHandler(handler as any));
