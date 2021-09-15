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
  try {
    let plugin = new DeviceRegistrationPlugin();
    let response = await plugin.findDevicesByUser(user);
    res.status(200).json(response);
  } catch (err) {
    res.status(500);
  }
}

export default JwtVerificationHandler(handler);
