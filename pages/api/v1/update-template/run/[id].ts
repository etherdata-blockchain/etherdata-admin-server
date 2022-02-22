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
  | interfaces.db.UpdateTemplateDBInterface
  | any;

/**
 * This will handle run request
 *
 * - **Post**: will create a list of pending jobs based on the update template's devices field
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const id = req.query.id;
  const { user } = req.body;
  const updateTemplateService = new dbServices.UpdateTemplateService();
  const executionPlanService = new dbServices.ExecutionPlanService();
  const pendingJobService = new dbServices.PendingJobService();

  const script = await updateTemplateService.getUpdateTemplateWithDockerImage(
    id as string
  );
  if (script === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find update script with id: ${id}` });
    return;
  }

  //Clear previous runs
  await executionPlanService.delete(id);

  //@ts-ignore
  const startPlanData: IExecutionPlan = {
    description: `Start running plan. Total number of devices: ${script.targetDeviceIds.length}`,
    isDone: false,
    isError: false,
    name: "Start running plan",
    updateTemplate: id,
  };

  // @ts-ignore
  const resultData: IExecutionPlan = {
    name: "Finished",
    description: "",
    isDone: false,
    isError: false,
    updateTemplate: id,
  };

  const startPlan = await executionPlanService.create(startPlanData, {
    upsert: false,
  });

  // Create list of update jobs
  const pendingUpdateJobs: any[] = script.targetDeviceIds.map((d) => ({
    targetDeviceId: d,
    from: user,
    task: {
      type: enums.JobTaskType.UpdateTemplate,
      value: {
        templateId: id,
      },
    },
  }));

  if (startPlan) {
    res.status(StatusCodes.OK).json({});
    try {
      await pendingJobService.insertMany(pendingUpdateJobs);
      startPlan!.isDone = true;
      resultData.description = "Update successfully";
      resultData.isDone = true;
      await executionPlanService.patch(startPlan);
      await executionPlanService.create(resultData, { upsert: false });
    } catch (err) {
      startPlan.isDone = true;
      startPlan.isError = true;
      startPlan.description = `${err}`;
      await executionPlanService.patch(startPlan);
      await executionPlanService.create(resultData, { upsert: false });
    }
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err: "Cannot create execution plan" });
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.POST,
]);
