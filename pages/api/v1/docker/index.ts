import type { NextApiRequest, NextApiResponse } from "next";
import { IDockerImage } from "../../../../internal/services/dbSchema/docker/docker-image";
import { DockerImagePluginPlugin } from "../../../../internal/services/dbServices/docker-image-plugin";
import { PaginationResult } from "../../../../server/plugin/basePlugin";
import { StatusCodes } from "http-status-codes";
import Logger from "../../../../server/logger";
import { paginationHandler } from "../../../../internal/nextHandler/paginationHandler";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwtVerificationHandler";

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
  const dockerPlugin = new DockerImagePluginPlugin();

  try {
    switch (req.method) {
      case "POST":
        await dockerPlugin.createWithDockerWebhookData(req.body);
        res.status(StatusCodes.CREATED).json({});
        break;
      case "GET":
        const { page, pageSize } = req.body;
        const result = await dockerPlugin.list(page, pageSize);
        res.status(StatusCodes.OK).json(result!);
        break;
    }
  } catch (e) {
    Logger.error(e);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Cannot handle this request" });
  }
}

export default jwtVerificationHandler(paginationHandler(handler));
