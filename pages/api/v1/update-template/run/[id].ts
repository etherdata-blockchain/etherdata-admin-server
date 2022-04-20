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
 * @swagger
 * /api/v1/update-template/run/[id]:
 *   name: Run update template
 *   post:
 *     tags: ["Update Template"]
 *     description: Run update template
 *     summary: Run update template
 *     parameters:
 *       - name: data
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             targetDeviceIds:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ok. Start running execution plan
 *       400:
 *         description: Not a valid request.
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *       500:
 *         description: Something went wrong.
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *       404:
 *         description: Update template not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const id = req.query.id;
  const { user, targetDeviceIds } = req.body;
  const updateTemplateService = new dbServices.UpdateTemplateService();
  const executionPlanService = new dbServices.ExecutionPlanService();
  const pendingJobService = new dbServices.PendingJobService();

  const template = await updateTemplateService.getUpdateTemplateWithDockerImage(
    id as string
  );

  if (targetDeviceIds === undefined) {
    res.status(StatusCodes.BAD_REQUEST);
    return;
  }

  if (template === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find update script with id: ${id}` });
    return;
  }

  //Clear previous runs
  await executionPlanService.delete(id);

  const startPlanData: interfaces.db.ExecutionPlanDBInterface = {
    description: `Start running plan. Total number of devices: ${template.targetDeviceIds.length}`,
    isDone: false,
    isError: false,
    name: "Start running plan",
    updateTemplate: id,
    createdAt: new Date(),
  };

  const resultData: interfaces.db.ExecutionPlanDBInterface = {
    name: "Finished",
    description: "",
    isDone: false,
    isError: false,
    updateTemplate: id,
    createdAt: new Date(),
  };

  const startPlan = await executionPlanService.create(startPlanData as any, {
    upsert: false,
  });

  // Create list of update jobs
  const pendingUpdateJobs: any[] = (targetDeviceIds as string[]).map((d) => ({
    targetDeviceId: d,
    from: user,
    task: {
      type: enums.JobTaskType.UpdateTemplate,
      value: {
        templateId: id,
      },
    },
  }));

  // start running execution plan
  if (startPlan) {
    res.status(StatusCodes.OK).json({});
    try {
      await pendingJobService.insertMany(pendingUpdateJobs);
      startPlan!.isDone = true;
      resultData.description = "Update successfully";
      resultData.isDone = true;
      // update template, add targetDeviceIds to the template
      // to keep the history
      template.targetDeviceIds = targetDeviceIds;

      await updateTemplateService.patch(template as any);
      await executionPlanService.patch(startPlan);
      await executionPlanService.create(resultData as any, { upsert: false });
    } catch (err) {
      startPlan.isDone = true;
      startPlan.isError = true;
      startPlan.description = `${err}`;
      await executionPlanService.patch(startPlan);
      await executionPlanService.create(resultData as any, { upsert: false });
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
