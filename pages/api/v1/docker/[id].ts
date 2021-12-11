import type { NextApiRequest, NextApiResponse } from "next";
import { IDockerImage } from "../../../../internal/services/dbSchema/docker/docker-image";
import { DockerImagePluginPlugin } from "../../../../internal/services/dbServices/docker-image-plugin";

type Response = { err?: string; message?: string } | IDockerImage[];

/**
 * Handle docker get request.
 * Clients will use this api to update the latest docker image version.
 * In most cases, these requests are coming from docker hub's web hook.
 * More examples on https://docs.docker.com/docker-hub/webhooks/.
 * ## Description
 * - **Get**: When a get request is sent by user, then we will return the docker image name,
 * version, update time to the user based on the id they provide.
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const dockerPlugin = new DockerImagePluginPlugin();

  res.status(200).json({});
}

export default handler;
