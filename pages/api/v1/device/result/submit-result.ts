import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { configs, enums, interfaces } from "@etherdata-blockchain/common";
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
 * @swagger
 * /api/v1/device/result/submit-result:
 *   name: Submit the job result
 *   post:
 *     tags: ["Job"]
 *     description: Submit the job result to the server
 *     summary: Submit the job result
 *     parameters:
 *       - name: result data
 *         in: body
 *         type: object
 *         required: true
 *         schema:
 *           $ref: "#/definitions/JobResultDBInterface"
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           properties:
 *             key:
 *                 type: string
 *                 description: jwt key for next request
 *
 *             error:
 *               type: string
 *               description: error
 *       401:
 *         description: The given user is not authenticated
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const body = req.body;
  // @ts-ignore
  const { user, key, jobId } = body as interfaces.db.JobResultDBInterface;

  const returnData: Data = {};

  try {
    const jobResultService = new dbServices.JobResultService();
    const pendingJobService = new dbServices.PendingJobService();
    const executionPlanService = new dbServices.ExecutionPlanService();

    const pendingJob = await pendingJobService.get(jobId);

    if (pendingJob === undefined || pendingJob === null) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "This result is outdated" });

      return;
    }

    body.deviceID = user;
    body._id = new ObjectId(jobId);
    returnData.key = key;
    // Update job result
    await jobResultService.patch(body);

    if (pendingJob.task.type === enums.JobTaskType.UpdateTemplate) {
      const job =
        pendingJob as unknown as interfaces.db.PendingJobDBInterface<enums.UpdateTemplateValueType>;

      // found plan with waiting for job result
      const foundName = `${job.targetDeviceId} received job`;
      const foundPlans = await executionPlanService.filter(
        { isDone: false, name: foundName },
        configs.Configurations.defaultPaginationStartingPage,
        1
      );
      if (foundPlans!.count > 0) {
        const foundPlan = foundPlans!.results[0];
        foundPlan.isDone = true;
        await executionPlanService.patch(foundPlan);
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
  } catch (err) {
    Logger.error(err);
    returnData.error = `${err}`;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(returnData);
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.POST,
]);
