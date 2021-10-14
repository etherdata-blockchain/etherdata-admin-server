import type { NextApiRequest, NextApiResponse } from "next";
import { PostOnlyMiddleware } from "../../../../../utils/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { JwtVerificationHandler } from "../../../../../utils/nextHandler/jwtVerificationHandler";
import { IDevice } from "../../../../../server/schema/device";
import moment from "moment";
import Logger from "../../../../../server/logger";
import { IPendingJob } from "../../../../../server/schema/pending-job";
import { PendingJobPlugin } from "../../../../../server/plugin/plugins/pendingJobPlugin";
import { JobResultPlugin } from "../../../../../server/plugin/plugins/jobResultPlugin";
import { IJobResult } from "../../../../../server/schema/job-result";
import * as mongoose from "mongoose";
import { ObjectId } from "mongodb";

type Data = {
  error?: string;
  key?: string;
};

/**
 * Get a job from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const result: IJobResult = req.body;
  //@ts-ignore
  const { user, key } = result;

  const returnData: Data = {};

  try {
    let plugin = new JobResultPlugin();
    let devicePlugin = new DeviceRegistrationPlugin();
    let [authorized, newKey] = await devicePlugin.auth(user, key);
    if (authorized) {
      result.deviceID = user;
      result._id = new ObjectId(result.jobId);
      returnData.key = newKey;
      await plugin.patch(result);
      res.status(201).json(returnData);
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

export default PostOnlyMiddleware(JwtVerificationHandler(handler));
