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
 * @swagger
 * /api/v1/device/job/get-job:
 *   name: Get a pending job
 *   get:
 *     tags: ["Job"]
 *     description: |
 *        Returns a pending job to the client
 *        If a job result is not sent to the server in a certain amount of time,
 *        then this job will be marked as retrievable and add retries counter by 1.
 *        If the job's retries exceed the limit, then this job will be removed.
 *
 *     summary: Get a pending job
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           properties:
 *             key:
 *                 type: string
 *                 description: jwt key for next request
 *             error:
 *               type: string
 *               description: error
 *             job:
 *               type: array
 *               description: an object which contains the job
 *               $ref: "#/definitions/PendingJob"
 *
 *       401:
 *         description: The given user is not authenticated
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
