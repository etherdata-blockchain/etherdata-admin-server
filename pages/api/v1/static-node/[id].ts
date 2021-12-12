import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StatusCodes } from "http-status-codes";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { StaticNodePlugin } from "../../../../internal/services/dbServices/static-node-plugin";
import { IStaticNode } from "../../../../internal/services/dbSchema/install-script/static-node";

type Response = { err?: string; message?: string } | IStaticNode;

/**
 * This will handle static node request by id;
 *
 * - **Patch**: will update a specific static node
 * - **Delete**: Will try to delete a static node
 * - **Get**: Will try to return the static node by id
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const id = req.query.id;
  const staticNodePlugin = new StaticNodePlugin();
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

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
