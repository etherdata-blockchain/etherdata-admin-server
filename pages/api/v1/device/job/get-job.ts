import type { NextApiRequest, NextApiResponse } from "next";
import { enums } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import Logger from "@etherdata-blockchain/logger";
import {
  deviceAuthorizationHandler,
  jwtVerificationHandler,
} from "@etherdata-blockchain/next-js-handlers";
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
  const { user: deviceId, key } = req.body;
  const returnData: Data = {};

  try {
    const plugin = new dbServices.PendingJobService();
    const executionPlanService = new dbServices.ExecutionPlanService();
    const ownerService = new dbServices.StorageManagementOwnerService();

    const job = await plugin.getJob<enums.UpdateTemplateValueType>(deviceId);
    if (job && job?.task.type === enums.JobTaskType.UpdateTemplate) {
      // If the job type is update template
      // Add waiting job result to execution plan
      const plan: any = {
        description: "Waiting for job result",
        isDone: false,
        isError: false,
        name: `${job.targetDeviceId} received job`,
        updateTemplate: (job.task.value as any).templateId,
      };
      await executionPlanService.create(plan, { upsert: false });

      // Check user's coinbase and set it to the job task's value
      const owner = await ownerService.getOwnerByDevice(deviceId);
      (job.task.value as enums.UpdateTemplateValueType).coinbase =
        owner?.coinbase;
    }

    returnData.job = job;
    returnData.key = key;
    res.status(StatusCodes.OK).json(returnData);
  } catch (err) {
    Logger.error(err);
    returnData.error = `${err}`;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
  }
}

export default jwtVerificationHandler(
  deviceAuthorizationHandler(handler as any)
);
