import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IDockerImage>
  | schema.IDockerImage;

/**
 * Handle docker update, delete, and list request.
 * Clients will use this api to update the latest docker image version.
 * ## Description
 * - **Post**: When a post request is sent by docker webhook, then we will compare
 * the version in the database. If no such image in our database, then we will create
 * such image, otherwise, we will update the current image version to the latest one.
 * - **List**: When a list request is sent by user, then we will return the list of docker images,
 * with their versions to the user.
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const dockerImageService = new dbServices.DockerImageService();
  switch (req.method) {
    case "POST":
      await dockerImageService.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
    case "GET":
      const { page, pageSize } = req.body;
      const result = await dockerImageService.list(page, pageSize);
      res.status(StatusCodes.OK).json(result!);
      break;
  }
}

export default jwtVerificationHandler(paginationHandler(handler as any));
