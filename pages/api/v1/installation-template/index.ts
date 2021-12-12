import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { paginationHandler } from "../../../../internal/nextHandler/paginationHandler";
import { InstallationPlugin } from "../../../../internal/services/dbServices/installation-plugin";
import { StatusCodes } from "http-status-codes";
import { IInstallationTemplate } from "../../../../internal/services/dbSchema/install-script/install-script";
import { PaginationResult } from "../../../../server/plugin/basePlugin";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";

type Response =
  | { err?: string; message?: string }
  | PaginationResult<IInstallationTemplate>
  | Buffer;

/**
 * This will handle installation template request.
 *
 * - **Post**: Will create a new template based on user request.
 * - **Get**: Will list templates
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const installScriptPlugin = new InstallationPlugin();

  /**
   * Will list templates by page number and page size
   */
  const handleListRequest = async () => {
    const { page, pageSize } = req.body;
    const results = await installScriptPlugin.list(page, pageSize);
    res.status(StatusCodes.OK).json(results!);
  };

  /**
   * Will create a template by user. Will automatically add user
   */
  const handlePostRequest = async () => {
    const { user } = req.body;

    const data = {
      ...req.body,
      created_by: user,
    };
    const result = await installScriptPlugin.createWithValidation(data, {
      upsert: false,
    });
    if (!result) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "image is not in docker image collection" });
      return;
    }
    res.status(StatusCodes.CREATED).json({ message: "OK" });
  };

  switch (req.method) {
    case "GET":
      await handleListRequest();
      break;

    case "POST":
      await handlePostRequest();
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
