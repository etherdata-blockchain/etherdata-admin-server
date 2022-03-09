import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationQueryHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { schema } from "@etherdata-blockchain/storage-model";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IDockerImage>
  | schema.IDockerImage;

/**
 * @swagger
 * /api/v1/docker/webhook:
 *   name: Health checking
 *   post:
 *     tags: ["Docker"]
 *     description: This api is used by dockerhub for webhook purpose. It only accepts a POST request.
 *     summary: Dockerhub webhook api
 *     parameters:
 *      - name: data
 *        in: body
 *        type: object
 *        required: true
 *        schema:
 *          $ref: "#/definitions/DockerWebhookInterface"
 *     responses:
 *       200:
 *         description: Server is up.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const dockerImageService = new dbServices.DockerImageService();

  switch (req.method) {
    case "POST":
      await dockerImageService.createWithDockerWebhookData(req.body);
      res.status(StatusCodes.CREATED).json({});
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationQueryHandler(paginationHandler(handler as any)),
  [HTTPMethod.POST]
);
