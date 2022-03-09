import type { NextApiRequest, NextApiResponse } from "next";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { StatusCodes } from "http-status-codes";

import HTTPMethod from "http-method-enum";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.InstallationTemplateDBInterface;

/**
 * @swagger
 * /api/v1/installation-template/[id]:
 *   name: Modify the given static node
 *   get:
 *     tags: ["Installation Template"]
 *     description: Get the installation template by id
 *     summary: Get the installation template by id
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           $ref: "#/definitions/InstallationTemplateDBInterface"
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
 *      tags: ["Installation Template"]
 *      description: Update the given installation template
 *      summary: Update the given installation template
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
 *        404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *   delete:
 *      tags: ["Installation Template"]
 *      description: Delete the given installation template
 *      summary: Delete the given installation template
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
  const installationService = new dbServices.InstallationService();
  const template = await installationService.get(id as string);
  if (template === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find template with id: ${id}` });
    return;
  }

  const data = {
    ...req.body,
    _id: id,
  };

  switch (req.method) {
    case HTTPMethod.GET:
      res.status(StatusCodes.OK).json(template);
      break;

    case HTTPMethod.PATCH:
      const patchResult = await installationService.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case HTTPMethod.DELETE:
      await installationService.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
