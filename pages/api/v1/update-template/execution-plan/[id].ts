import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { IExecutionPlan } from "../../../../../internal/services/dbSchema/update-template/execution_plan";
import { methodAllowedHandler } from "../../../../../internal/nextHandler/method_allowed_handler";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import HTTPMethod from "http-method-enum";
import { ExecutionPlanPlugin } from "../../../../../internal/services/dbServices/execution-plan-plugin";
import { UpdateScriptPlugin } from "../../../../../internal/services/dbServices/update-script-plugin";

type Response = { err?: string; message?: string } | IExecutionPlan[] | any;

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
  const id = req.query.id;
  const executionPlanPlugin = new ExecutionPlanPlugin();
  const updateTemplatePlugin = new UpdateScriptPlugin();

  const script = await updateTemplatePlugin.get(id as string);
  if (script === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find update script with id: ${id}` });
    return;
  }

  const data = {
    ...req.body,
    updateTemplate: id as string,
  };

  switch (req.method) {
    case "GET":
      const executionPlans = await executionPlanPlugin.getPlans(id as string);
      res.status(StatusCodes.OK).json(executionPlans);
      break;

    case "POST":
      const patchResult = await executionPlanPlugin.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await executionPlanPlugin.delete(id);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.POST,
  HTTPMethod.DELETE,
]);
