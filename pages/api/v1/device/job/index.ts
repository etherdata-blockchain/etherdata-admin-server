import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import Logger from "../../../../../server/logger";
import {
  AnyValueType,
  IPendingJob,
} from "../../../../../internal/services/dbSchema/queue/pending-job";
import { PendingJobPlugin } from "../../../../../internal/services/dbServices/pending-job-plugin";
import { methodAllowedHandler } from "../../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { Configurations } from "../../../../../internal/const/configurations";
import { StatusCodes } from "http-status-codes";
import { PaginationResult } from "../../../../../internal/const/common_interfaces";

type Data = PaginationResult<IPendingJob<AnyValueType>>;

/**
 * Get list of jobs from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const plugin = new PendingJobPlugin();
  const results = await plugin.list(
    Configurations.defaultPaginationStartingPage,
    Configurations.numberPerPage
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
