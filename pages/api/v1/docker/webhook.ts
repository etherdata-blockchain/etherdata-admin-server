import type { NextApiRequest, NextApiResponse } from "next";
import { IDockerImage } from "../../../../internal/services/dbSchema/docker/docker-image";
import { DockerImagePlugin } from "../../../../internal/services/dbServices/docker-image-plugin";
import { PaginationResult } from "../../../../server/plugin/basePlugin";
import { StatusCodes } from "http-status-codes";
import Logger from "../../../../server/logger";
import { paginationHandler } from "../../../../internal/nextHandler/paginationHandler";
import { jwtVerificationQueryHandler } from "../../../../internal/nextHandler/jwt_verification_query_handler";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";

type Response =
  | { err?: string; message?: string }
  | PaginationResult<IDockerImage>
  | IDockerImage;

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
  const dockerPlugin = new DockerImagePlugin();

  switch (req.method) {
    case "POST":
      await dockerPlugin.createWithDockerWebhookData(req.body);
      res.status(StatusCodes.CREATED).json({});
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationQueryHandler(paginationHandler(handler)),
  [HTTPMethod.POST]
);
