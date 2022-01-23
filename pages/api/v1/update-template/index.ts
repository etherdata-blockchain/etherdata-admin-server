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
  | interfaces.PaginationResult<schema.IUpdateTemplate>
  | schema.IUpdateTemplate;

/**
 * Handle update script create, list.
 * ## Description
 * - **Post**: Create an update template
 * - **List**: Get list of update templates
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const updateTemplateService = new dbServices.UpdateTemplateService();
  switch (req.method) {
    case HTTPMethod.POST:
      await updateTemplateService.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
    case HTTPMethod.GET:
      const { page, pageSize } = req.body;
      const result = await updateTemplateService.list(page, pageSize);
      res.status(StatusCodes.OK).json(result!);
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
