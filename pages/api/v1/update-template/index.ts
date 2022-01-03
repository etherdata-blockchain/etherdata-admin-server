import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { paginationHandler } from "../../../../internal/nextHandler/paginationHandler";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { PaginationResult } from "../../../../internal/const/common_interfaces";
import { UpdateScriptPlugin } from "../../../../internal/services/dbServices/update-script-plugin";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { IUpdateTemplate } from "../../../../internal/services/dbSchema/update-template/update_template";

type Response =
  | { err?: string; message?: string }
  | PaginationResult<IUpdateTemplate>
  | IUpdateTemplate;

/**
 * Handle update script create, list.
 * ## Description
 * - **Post**: Create an update template
 * - **List**: Get list of update templates
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const updateScriptPlugin = new UpdateScriptPlugin();
  switch (req.method) {
    case "POST":
      await updateScriptPlugin.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
    case "GET":
      const { page, pageSize } = req.body;
      const result = await updateScriptPlugin.list(page, pageSize);
      res.status(StatusCodes.OK).json(result!);
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
