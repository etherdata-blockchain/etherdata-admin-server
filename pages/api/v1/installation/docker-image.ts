import type { NextApiRequest, NextApiResponse } from "next";
import { clientOnlyHandler } from "../../../../internal/nextHandler/clientOnlyHandler";
import { DockerImagePluginPlugin } from "../../../../internal/services/dbServices/docker-image-plugin";

/**
 * Health checking
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const dockerImagePlugin = new DockerImagePluginPlugin();
  try {
    await dockerImagePlugin.create(req.body, { upsert: true });
    res.status(201).json({});
  } catch (e) {
    res.status(500).json({ reason: "Cannot create data" });
  }
}

export default clientOnlyHandler(handler);
