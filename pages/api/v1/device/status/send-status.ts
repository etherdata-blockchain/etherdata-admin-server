import type { NextApiRequest, NextApiResponse } from "next";
import { PostOnlyMiddleware } from "../../../../../utils/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { JwtVerificationHandler } from "../../../../../utils/nextHandler/jwtVerificationHandler";
import { IDevice } from "../../../../../server/schema/device";
import moment from "moment";
import { Web3DataInfo } from "../../../../../server/client/node_data";
import Logger from "../../../../../server/logger";

type Data = {
  error?: string;
  data?: IDevice;
};

/**
 * Found device by given user
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, data, nodeName } = req.body;

  const returnData: Data = {};

  if (!nodeName) {
    data.error = "You must provide node name";
    res.status(500).json(data);
  }

  try {
    let plugin = new DeviceRegistrationPlugin();
    let authenticated = await plugin.auth(user);
    if (!authenticated) {
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
    };

    let responseData = await plugin.patch(deviceData as IDevice);
    res.status(201).json({ data: responseData });
  } catch (err) {
    Logger.error(err);
    returnData.error = err;
    res.status(500).json(returnData);
  }
}

export default PostOnlyMiddleware(JwtVerificationHandler(handler));
