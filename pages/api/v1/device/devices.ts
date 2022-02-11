import type { NextApiRequest, NextApiResponse } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import { jwtVerificationHandler } from "@etherdata-blockchain/next-js-handlers";

/**
 * Found user by given user
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.body;

  const plugin = new dbServices.StorageManagementService();
  const devices = await plugin.getDevicesByUser(user);
  if (devices) {
    res.status(200).json(devices);
  } else {
    res.status(500).json({ reason: "" });
  }
}

export default jwtVerificationHandler(handler);
