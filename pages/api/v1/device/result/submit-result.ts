import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { enums } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import Logger from "@etherdata-blockchain/logger";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";

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
  const body = req.body;
  // @ts-ignore
  const { user, key, result } = body as { result: IJobResult };

  const returnData: Data = {};

  try {
    const jobResultService = new dbServices.JobResultService();
    const deviceRegistrationService =
      new dbServices.DeviceRegistrationService();
    const pendingJobService = new dbServices.PendingJobService();
    const executionPlanService = new dbServices.ExecutionPlanService();

    const [authorized, newKey] = await deviceRegistrationService.auth(
      user,
      key
    );
    const pendingJob = await pendingJobService.get(result.jobId);

    if (pendingJob === undefined) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "This result is outdated" });

      return;
    }

    if (authorized) {
      result.deviceID = user;
      result._id = new ObjectId(result.jobId);
      returnData.key = newKey;
      // Update job result
      await jobResultService.patch(result);

      if (pendingJob.task.type === enums.JobTaskType.UpdateTemplate) {
        // Update execution plan
        const plan: any = {
          description: `${result.result}`,
          isDone: true,
          isError: !result.success,
          name: `${pendingJob.targetDeviceId} finished processing job`,
          updateTemplate: pendingJob.task.value,
        };
        await executionPlanService.create(plan, { upsert: false });
      }
      await pendingJobService.delete(pendingJob._id);
      res.status(StatusCodes.CREATED).json(returnData);
    } else {
      returnData.error = "Device is not in our DB";
      res.status(StatusCodes.NOT_FOUND).json(returnData);
    }
  } catch (err) {
    Logger.error(err);
    returnData.error = `${err}`;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.POST,
]);
