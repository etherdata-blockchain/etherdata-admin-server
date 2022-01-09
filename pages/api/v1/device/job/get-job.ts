import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import Logger from "../../../../../server/logger";
import {
  AnyValueType,
  IPendingJob,
} from "../../../../../internal/services/dbSchema/queue/pending-job";
import { PendingJobPlugin } from "../../../../../internal/services/dbServices/pending-job-plugin";

type Data = {
  error?: string;
  job?: IPendingJob<AnyValueType>;
  key?: string;
};

/**
 * Get a job from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  //User is the device id and key is the key used in previous request.
  //If this is the first time that device calls this api, then token is undefined.
  //The reason why we provide both key and user for to our api is that
  //the key's verification process happens in memory and no database connection required.
  //However, when key is not presented, then the database connection is required
  //to authenticate the user is valid.
  const { user: deviceId, key } = req.body;
  const returnData: Data = {};

  try {
    const plugin = new PendingJobPlugin();
    const devicePlugin = new DeviceRegistrationPlugin();
    const [authorized, newKey] = await devicePlugin.auth(deviceId, key);
    if (authorized) {
      const job = await plugin.getJob(deviceId);
      returnData.job = job;
      returnData.key = newKey;
      res.status(200).json(returnData);
    } else {
      Logger.error("Device is not in our DB");
      returnData.error = "Device is not in our DB";
      res.status(500).json(returnData);
    }
  } catch (err) {
    Logger.error(err);
    // @ts-ignore
    returnData.error = err;
    res.status(500).json(returnData);
  }
}

export default jwtVerificationHandler(handler);
