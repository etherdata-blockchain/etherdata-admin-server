import type { NextApiRequest, NextApiResponse } from "next";
import { PostOnlyMiddleware } from "../../../../utils/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { JwtVerificationHandler } from "../../../../utils/nextHandler/jwtVerificationHandler";
import { IDevice } from "../../../../server/schema/device";

type Data = {
  devices: IDevice[];
};

/**
 * Found device by given user
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.body;

  let plugin = new DeviceRegistrationPlugin();
  const [success, err, devices] = await plugin.getDevicesByUser(user);
  if (success) {
    res.status(200).json(devices);
  } else {
    res.status(500).json({ reason: err });
  }
}

export default JwtVerificationHandler(handler);
