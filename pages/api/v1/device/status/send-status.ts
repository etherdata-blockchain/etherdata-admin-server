import type { NextApiRequest, NextApiResponse } from "next";
import moment from "moment";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import Logger from "@etherdata-blockchain/logger";
import { StatusCodes } from "http-status-codes";
import {
  deviceAuthorizationHandler,
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import path from "path";

type Data = {
  error?: string;
  data?: schema.IDevice;
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
    return;
  }

  try {
    const plugin = new dbServices.DeviceRegistrationService();

    const lastSeen = moment().toDate();
    const deviceData = {
      lastSeen: lastSeen,
      id: user,
      name: nodeName,
      data: data,
      adminVersion,
      docker,
    };

    const responseData = await plugin.patch(deviceData as schema.IDevice);
    res.status(StatusCodes.OK).json({ data: responseData, key: key });
  } catch (err) {
    Logger.error(`${__filename}: ${err}`);
    returnData.error = `${err}`;
    res.status(StatusCodes.NOT_FOUND).json(returnData);
    return;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(deviceAuthorizationHandler(handler as any)),
  [HTTPMethod.POST]
);
