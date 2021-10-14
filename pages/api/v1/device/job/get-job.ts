import type { NextApiRequest, NextApiResponse } from "next";
import { PostOnlyMiddleware } from "../../../../../utils/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { JwtVerificationHandler } from "../../../../../utils/nextHandler/jwtVerificationHandler";
import { IDevice } from "../../../../../server/schema/device";
import moment from "moment";
import Logger from "../../../../../server/logger";
import { IPendingJob } from "../../../../../server/schema/pending-job";
import { PendingJobPlugin } from "../../../../../server/plugin/plugins/pendingJobPlugin";

type Data = {
  error?: string;
  job?: IPendingJob;
  key?: string;
};

/**
 * Get a job from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, key } = req.body;
  const returnData: Data = {};

  try {
    let plugin = new PendingJobPlugin();
    let devicePlugin = new DeviceRegistrationPlugin();
    let [authorized, newKey] = await devicePlugin.auth(user, key);
    if (authorized) {
      let job = await plugin.getJob(user);
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
    returnData.error = err;
    res.status(500).json(returnData);
  }
}

export default JwtVerificationHandler(handler);
