import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { jwtVerificationHandler } from "../../../../../utils/nextHandler/jwtVerificationHandler";
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
    const plugin = new PendingJobPlugin();
    const devicePlugin = new DeviceRegistrationPlugin();
    const [authorized, newKey] = await devicePlugin.auth(user, key);
    if (authorized) {
      const job = await plugin.getJob(user);
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
