import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  methodAllowedHandler,
  jwtVerificationHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.DockerImageDBInterface;

/**
 * This will handle docker request by id.
 *
 * - **Patch**: will update specific docker image
 * - **Delete**: Will try to delete a docker image
 * - **Get**: Will try to return the docker image by id
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
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
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
