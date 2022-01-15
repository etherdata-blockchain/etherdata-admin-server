import type { NextApiRequest, NextApiResponse } from "next";
import { postOnlyMiddleware } from "../../../../../internal/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import Logger from "../../../../../server/logger";
import { JobResultPlugin } from "../../../../../internal/services/dbServices/job-result-plugin";
import { IJobResult } from "../../../../../internal/services/dbSchema/queue/job-result";
import { ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { PendingJobPlugin } from "../../../../../internal/services/dbServices/pending-job-plugin";
import { ExecutionPlanPlugin } from "../../../../../internal/services/dbServices/execution-plan-plugin";
import { IExecutionPlan } from "../../../../../internal/services/dbSchema/update-template/execution_plan";
import { JobTaskType } from "../../../../../internal/services/dbSchema/queue/pending-job";

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
    const plugin = new JobResultPlugin();
    const devicePlugin = new DeviceRegistrationPlugin();
    const pendingJobPlugin = new PendingJobPlugin();
    const executionPlanPlugin = new ExecutionPlanPlugin();

    const [authorized, newKey] = await devicePlugin.auth(user, key);
    const pendingJob = await pendingJobPlugin.get(result.jobId);

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
      await plugin.patch(result);

      if (pendingJob.task.type === JobTaskType.UpdateTemplate) {
        // Update execution plan
        const plan: any = {
          description: `${result.result}`,
          isDone: true,
          isError: !result.success,
          name: `${pendingJob.targetDeviceId} finished processing job`,
          updateTemplate: pendingJob.task.value,
        };
        await executionPlanPlugin.create(plan, { upsert: false });
      }
      await pendingJobPlugin.delete(pendingJob._id);
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
