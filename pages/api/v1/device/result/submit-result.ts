import type { NextApiRequest, NextApiResponse } from "next";
import { postOnlyMiddleware } from "../../../../../internal/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import Logger from "../../../../../server/logger";
import { JobResultPlugin } from "../../../../../internal/services/dbServices/job-result-plugin";
import { IJobResult } from "../../../../../internal/services/dbSchema/queue/job-result";
import { ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";

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
  // @ts-ignore
  const { user, key } = result;

  const returnData: Data = {};

  try {
    const plugin = new JobResultPlugin();
    const devicePlugin = new DeviceRegistrationPlugin();
    const [authorized, newKey] = await devicePlugin.auth(user, key);
    if (authorized) {
      result.deviceID = user;
      result._id = new ObjectId(result.jobId);
      returnData.key = newKey;
      await plugin.patch(result);
      res.status(StatusCodes.CREATED).json(returnData);
    } else {
      returnData.error = "Device is not in our DB";
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
    }
  } catch (err) {
    Logger.error(err);
    returnData.error = `${err}`;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
  }
}

export default postOnlyMiddleware(jwtVerificationHandler(handler));
