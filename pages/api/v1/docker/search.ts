import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StatusCodes } from "http-status-codes";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { DockerImagePlugin } from "../../../../internal/services/dbServices/docker-image-plugin";
import { IDockerImage } from "../../../../internal/services/dbSchema/docker/docker-image";

type Response = { err?: string; message?: string } | IDockerImage[];

/**
 * This api will return a list of docker images by search keyword
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const key = req.query.key;
  const dockerImagePlugin = new DockerImagePlugin();
  const dockerImages = await dockerImagePlugin.search(key as string);
  res.status(StatusCodes.OK).json(dockerImages);
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
