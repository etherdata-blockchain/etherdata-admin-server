import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StatusCodes } from "http-status-codes";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { DockerImagePlugin } from "../../../../internal/services/dbServices/docker-image-plugin";
import { IDockerImage } from "../../../../internal/services/dbSchema/docker/docker-image";

type Response = { err?: string; message?: string } | IDockerImage;

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
  const dockerImagePlugin = new DockerImagePlugin();
  const dockerImage = await dockerImagePlugin.get(id as string);
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
      res.status(StatusCodes.OK).json(dockerImage);
      break;

    case "PATCH":
      const patchResult = await dockerImagePlugin.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await dockerImagePlugin.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
