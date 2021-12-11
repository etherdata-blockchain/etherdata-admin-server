import type { NextApiRequest, NextApiResponse } from "next";
import { postOnlyMiddleware } from "../../../../../internal/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import { IDevice } from "../../../../../internal/services/dbSchema/device";
import moment from "moment";
import Logger from "../../../../../server/logger";

type Data = {
  error?: string;
  data?: IDevice;
  key?: string;
};

/**
 * Found user by given user
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, data, nodeName, adminVersion, key, docker } = req.body;

  const returnData: Data = {};

  if (!nodeName) {
    Logger.error(`${user}: You must provide a node name`);
    returnData.error = "You must provide a node name";
    res.status(500).json(returnData);
    return;
  }

  try {
    const plugin = new DeviceRegistrationPlugin();
    const [authenticated, newKey] = await plugin.auth(user, key);
    if (!authenticated) {
      Logger.error(
        `${user}: is not registered in our storage management system`
      );
      returnData.error = "Device is not registered";
      res.status(403).json(returnData);
      return;
    }

    const lastSeen = moment().toDate();
    const deviceData = {
      lastSeen: lastSeen,
      id: user,
      name: nodeName,
      data: data,
      adminVersion,
      docker,
    };

    const responseData = await plugin.patch(deviceData as IDevice);
    res.status(201).json({ data: responseData, key: newKey });
  } catch (err) {
    Logger.error(err);
    returnData.error = `${err}`;
    res.status(500).json(returnData);
    return;
  }
}

export default postOnlyMiddleware(jwtVerificationHandler(handler));
