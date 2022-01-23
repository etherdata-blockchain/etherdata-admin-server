import type { NextApiRequest, NextApiResponse } from "next";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { configs, enums, interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Data = interfaces.PaginationResult<schema.IPendingJob<enums.AnyValueType>>;

/**
 * Get list of jobs from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const pendingJobService = new dbServices.PendingJobService();
  const results = await pendingJobService.list(
    configs.Configurations.defaultPaginationStartingPage,
    configs.Configurations.numberPerPage
  );

  if (results) {
    res.status(StatusCodes.OK).json(results);
  } else {
    res.status(StatusCodes.NOT_FOUND);
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
