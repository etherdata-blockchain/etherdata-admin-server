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
 * This api will return a list of docker images by search keyword
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const key = req.query.key;
  const dockerImagePlugin = new dbServices.DockerImageService();
  const dockerImages = await dockerImagePlugin.search(key as string);
  res.status(StatusCodes.OK).json(dockerImages);
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
