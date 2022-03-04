import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.DockerImageDBInterface;

/**
 * @swagger
 * /api/v1/docker/[id]:
 *   name: Modify the given docker image
 *   get:
 *     tags: ["Docker"]
 *     description: List all the docker images stored on this server
 *     summary: Modify the given docker image
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           $ref: "#/definitions/DockerImageDBInterface"
 *       404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *
 *   patch:
 *      tags: ["Docker"]
 *      description: Update the given docker image
 *      summary: Update the given docker image
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
 *        404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *   delete:
 *      tags: ["Docker"]
 *      description: Delete the given docker image
 *      summary: Delete the given docker image
 *      responses:
 *        204:
 *          description: Deleted
 *        404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const id = req.query.id;
  const dockerImageService = new dbServices.DockerImageService();
  const dockerImage = await dockerImageService.get(id as string);
  if (dockerImage === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find docker image with id: ${id}` });
    return;
  }

  const data = {
    ...req.body,
    _id: id,
  };

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json(dockerImage as any);
      break;

    case "PATCH":
      const patchResult = await dockerImageService.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult! as any);
      break;

    case "DELETE":
      await dockerImageService.delete(data);
      res.status(StatusCodes.NO_CONTENT).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
