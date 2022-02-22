import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { enums, interfaces } from "@etherdata-blockchain/common";
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
  const { user, key, jobId } = body as interfaces.db.JobResultDBInterface;

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
    const pendingJob = await pendingJobService.get(jobId);

    if (pendingJob === undefined || pendingJob === null) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "This result is outdated" });

      return;
    }

    if (authorized) {
      body.deviceID = user;
      body._id = new ObjectId(jobId);
      returnData.key = newKey;
      // Update job result
      await jobResultService.patch(body);

      if (pendingJob.task.type === enums.JobTaskType.UpdateTemplate) {
        const job =
          pendingJob as unknown as interfaces.db.PendingJobDBInterface<enums.UpdateTemplateValueType>;
        // Get last execution plan
        const plans = await executionPlanService.getPlans(
          job.task.value.templateId
        );

        if (plans && plans.length > 0) {
          const lastPlan = plans[plans.length - 1];
          lastPlan.isDone = true;
          await executionPlanService.patch(lastPlan);
        }

        // Update execution plan
        const plan: interfaces.db.ExecutionPlanDBInterface = {
          description: `${body.result}`,
          isDone: true,
          isError: !body.success,
          name: `${job.targetDeviceId} finished processing job`,
          updateTemplate: job.task.value.templateId,
          createdAt: new Date(),
        };
        await executionPlanService.create(plan as any, { upsert: false });
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

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.POST,
]);
