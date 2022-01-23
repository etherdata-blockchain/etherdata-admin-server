import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IInstallationTemplate>
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
  const installationService = new dbServices.InstallationService();

  /**
   * Will list templates by page number and page size
   */
  const handleListRequest = async () => {
    const { page, pageSize } = req.body;
    const results = await installationService.list(page, pageSize);
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
    const result = await installationService.createWithValidation(data, {
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
