import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  methodAllowedHandler,
  jwtVerificationHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.ExecutionPlanDBInterface[]
  | any;

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
  const executionPlanService = new dbServices.ExecutionPlanService();
  const updateTemplateService = new dbServices.UpdateTemplateService();

  const script = await updateTemplateService.get(id as string);
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
      const executionPlans = await executionPlanService.getPlans(id as string);
      res.status(StatusCodes.OK).json(executionPlans);
      break;

    case "POST":
      const patchResult = await executionPlanService.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await executionPlanService.delete(id);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.POST,
  HTTPMethod.DELETE,
]);
