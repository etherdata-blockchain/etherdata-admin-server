import { NextApiRequest, NextApiResponse } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  deviceAuthorizationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";

/**
 * Handle device register request.
 * When user submit a register device,
 * this handler will try to find the matched device,
 * and try to register the user info in the database
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  res.status(StatusCodes.OK);
}

export default methodAllowedHandler(
  jwtVerificationHandler(deviceAuthorizationHandler(handler as any)),
  [HTTPMethod.POST, HTTPMethod.GET]
);
