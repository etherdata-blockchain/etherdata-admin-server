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
  | interfaces.db.StaticNodeDBInterface;

/**
 * @swagger
 * /api/v1/static-node/[id]:
 *   name: Modify the given static node
 *   get:
 *     tags: ["Static Node"]
 *     description: Get the static node by id
 *     summary: Get the static node by id
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           $ref: "#/definitions/StaticNodeDBInterface"
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
 *      tags: ["Static Node"]
 *      description: Update the given static node
 *      summary: Update the given static node
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
 *        404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *   delete:
 *      tags: ["Static Node"]
 *      description: Delete the given static node
 *      summary: Delete the given static node
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
  const staticNodePlugin = new dbServices.StaticNodeService();
  const staticNode = await staticNodePlugin.get(id as string);
  if (staticNode === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find static node with id: ${id}` });
    return;
  }

  const data = {
    ...req.body,
    _id: id,
  };

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json(staticNode);
      break;

    case "PATCH":
      const patchResult = await staticNodePlugin.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await staticNodePlugin.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
