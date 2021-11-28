import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../services/dbServices/deviceRegistrationPlugin";
import { jwtVerificationHandler } from "../../../../utils/nextHandler/jwtVerificationHandler";

/**
 * Found user by given user
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.body;

  const plugin = new DeviceRegistrationPlugin();
  const [success, err, devices] = await plugin.getDevicesByUser(user);
  if (success) {
    res.status(200).json(devices);
  } else {
    res.status(500).json({ reason: err });
  }
}

export default jwtVerificationHandler(handler);
