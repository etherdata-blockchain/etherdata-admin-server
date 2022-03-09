import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response = { err?: string; message?: string } | schema.IDockerImage[];

/**
 * @swagger
 * /api/v1/docker/search:
 *   name: Search docker images by keyword
 *   get:
 *     tags: ["Docker"]
 *     description: Returns matched docker images
 *     summary: Search docker images by keyword
 *     parameters:
 *       - name: key
 *         in: query
 *         type: string
 *         description: Search keyword
 *         required: false
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           $ref: "#/definitions/DockerImageDBInterface"
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const key = req.query.key;
  const dockerImagePlugin = new dbServices.DockerImageService();
  const dockerImages = await dockerImagePlugin.search(key as string);
  res.status(StatusCodes.OK).json(dockerImages);
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
]);
