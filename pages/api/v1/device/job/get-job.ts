import type { NextApiRequest, NextApiResponse } from "next";
import { enums } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import Logger from "@etherdata-blockchain/logger";
import { jwtVerificationHandler } from "@etherdata-blockchain/next-js-handlers";
import { StatusCodes } from "http-status-codes";

type Data = {
  error?: string;
  job?: schema.IPendingJob<enums.AnyValueType>;
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
    const plugin = new dbServices.PendingJobService();
    const executionPlanPlugin = new dbServices.ExecutionPlanService();

    const devicePlugin = new dbServices.DeviceRegistrationService();
    const [authorized, newKey] = await devicePlugin.auth(deviceId, key);
    if (authorized) {
      const job = await plugin.getJob<enums.UpdateTemplateValueType>(deviceId);
      if (job?.task.type === enums.JobTaskType.UpdateTemplate) {
        // If the job type is update template
        // Add waiting job result to execution plan
        const plan: any = {
          description: "Waiting for job result",
          isDone: false,
          isError: false,
          name: `${job.targetDeviceId} received job`,
          updateTemplate: (job.task.value as any).templateId,
        };
        await executionPlanPlugin.create(plan, { upsert: false });
      }

      returnData.job = job;
      returnData.key = newKey;
      res.status(StatusCodes.OK).json(returnData);
    } else {
      Logger.error(`${__filename} Device is not in our DB`);
      returnData.error = "Device is not in our DB";
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
    }
  } catch (err) {
    Logger.error(err);
    // @ts-ignore
    returnData.error = err;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
  }
}

export default jwtVerificationHandler(handler);
