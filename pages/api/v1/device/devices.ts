import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StorageManagementItemPlugin } from "../../../../internal/services/dbServices/storage-management-item-plugin";

/**
 * Found user by given user
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.body;

  const plugin = new StorageManagementItemPlugin();
  const devices = await plugin.getDevicesByUser(user);
  if (devices) {
    res.status(200).json(devices);
  } else {
    res.status(500).json({ reason: "" });
  }
}

export default jwtVerificationHandler(handler);
