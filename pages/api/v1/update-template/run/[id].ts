import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import { StatusCodes } from "http-status-codes";
import { methodAllowedHandler } from "../../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { UpdateScriptPlugin } from "../../../../../internal/services/dbServices/update-script-plugin";
import { IUpdateTemplate } from "../../../../../internal/services/dbSchema/update-template/update-template";
import { PendingJobPlugin } from "../../../../../internal/services/dbServices/pending-job-plugin";
import { ExecutionPlanPlugin } from "../../../../../internal/services/dbServices/execution-plan-plugin";
import { JobTaskType } from "../../../../../internal/services/dbSchema/queue/pending-job";
import { IExecutionPlan } from "../../../../../internal/services/dbSchema/update-template/execution_plan";

type Response = { err?: string; message?: string } | IUpdateTemplate | any;

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
  const updateScriptPlugin = new UpdateScriptPlugin();
  const executionPlanPlugin = new ExecutionPlanPlugin();
  const jobPlugin = new PendingJobPlugin();

  const script = await updateScriptPlugin.getUpdateTemplateWithDockerImage(
    id as string
  );
  if (script === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find update script with id: ${id}` });
    return;
  }

  //Clear previous runs
  await executionPlanPlugin.delete(id);

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

  const startPlan = await executionPlanPlugin.create(startPlanData, {
    upsert: false,
  });

  // Create list of update jobs
  const pendingUpdateJobs: any[] = script.targetDeviceIds.map((d) => ({
    targetDeviceId: d,
    from: user,
    task: {
      type: JobTaskType.UpdateTemplate,
      value: {
        templateId: id,
      },
    },
  }));

  if (startPlan) {
    res.status(StatusCodes.OK).json({});
    try {
      await jobPlugin.insertMany(pendingUpdateJobs);
      startPlan!.isDone = true;
      resultData.description = "Update successfully";
      resultData.isDone = true;
      await executionPlanPlugin.patch(startPlan);
      await executionPlanPlugin.create(resultData, { upsert: false });
    } catch (err) {
      startPlan.isDone = true;
      startPlan.isError = true;
      startPlan.description = `${err}`;
      await executionPlanPlugin.patch(startPlan);
      await executionPlanPlugin.create(resultData, { upsert: false });
    }
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err: "Cannot create execution plan" });
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.POST,
]);
