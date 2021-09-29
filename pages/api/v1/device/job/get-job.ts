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
};

/**
 * Get a job from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user } = req.body;

  const returnData: Data = {};

  try {
    let plugin = new PendingJobPlugin();
    let devicePlugin = new DeviceRegistrationPlugin();
    let authorized = await devicePlugin.auth(user);
    if (authorized) {
      let job = await plugin.getJob(user);
      returnData.job = job;
      res.status(200).json(returnData);
    } else {
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
