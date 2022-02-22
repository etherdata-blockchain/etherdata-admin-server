import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationQueryHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { schema } from "@etherdata-blockchain/storage-model";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IDockerImage>
  | schema.IDockerImage;

/**
 * Handle docker update, delete, and list request.
 * Clients will use this api to update the latest docker image version.
 * In most cases, these requests are coming from docker hub's web hook.
 * More examples on https://docs.docker.com/docker-hub/webhooks/.
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
      await dockerImageService.createWithDockerWebhookData(req.body);
      res.status(StatusCodes.CREATED).json({});
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationQueryHandler(paginationHandler(handler as any)),
  [HTTPMethod.POST]
);
