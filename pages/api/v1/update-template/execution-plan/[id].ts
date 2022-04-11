import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { enums, interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.ExecutionPlanDBInterface[]
  | any;

/**
 * Add pending indicator to the execution plans
 * @param executionPlans
 * @param pendingJobService
 * @param updateTemplateId
 */
export async function addPendingPlans(
  executionPlans: interfaces.db.ExecutionPlanDBInterface[] | undefined,
  pendingJobService: dbServices.PendingJobService,
  updateTemplateId: string | string[]
) {
  if (executionPlans) {
    const numOfNotRetrievedJobs =
      await pendingJobService.getNumberOfNotRetrievedJobs({
        "task.type": enums.JobTaskType.UpdateTemplate,
        "task.value.templateId": updateTemplateId,
      });
    if (numOfNotRetrievedJobs > 0) {
      const remainingPlan: interfaces.db.ExecutionPlanDBInterface = {
        createdAt: new Date(),
        updateTemplate: updateTemplateId,
        isDone: false,
        isError: false,
        name: `${numOfNotRetrievedJobs} jobs are not retrieved`,
        description: "",
      };
      executionPlans.push(remainingPlan);
    }
  }
}

/**
 * This will handle get execution plans by update template
 *
 * - **Post**: will create a plan by update plan's id
 * - **Delete**: Will try to delete all plans by update template
 * - **Get**: Will get all plans by update template's id
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const updateTemplateId = req.query.id;
  const executionPlanService = new dbServices.ExecutionPlanService();
  const updateTemplateService = new dbServices.UpdateTemplateService();
  const pendingJobService = new dbServices.PendingJobService();

  const template = await updateTemplateService.get(updateTemplateId as string);
  if (template === undefined || template === null) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find update script with id: ${updateTemplateId}` });
    return;
  }

  const data = {
    ...req.body,
    updateTemplate: updateTemplateId as string,
  };

  /**
   * Perform get operation
   */
  async function performGet() {
    const executionPlans = (await executionPlanService.getPlans(
      updateTemplateId as string
    )) as unknown as interfaces.db.ExecutionPlanDBInterface[] | undefined;
    // Add remaining counter
    await addPendingPlans(executionPlans, pendingJobService, updateTemplateId);

    res.status(StatusCodes.OK).json(executionPlans);
  }

  /**
   * Perform post operation
   */
  async function performPost() {
    const patchResult = await executionPlanService.create(data, {
      upsert: true,
    });
    res.status(StatusCodes.OK).json(patchResult!);
  }

  /**
   * Perform delete operation
   */
  async function performDelete() {
    await executionPlanService.delete(updateTemplateId);
    res.status(StatusCodes.OK).json({ message: "OK" });
  }

  switch (req.method) {
    case HTTPMethod.GET:
      await performGet();
      break;

    case HTTPMethod.POST:
      await performPost();
      break;

    case HTTPMethod.DELETE:
      await performDelete();
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
  HTTPMethod.POST,
  HTTPMethod.DELETE,
]);
