import { NextApiRequest, NextApiResponse } from "next";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  deviceAuthorizationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";

/**
 * @swagger
 * /api/v1/auth:
 *   name: Authenticate the device
 *   post:
 *     tags: ["Auth"]
 *     description: Returns the requested device is registered in our database
 *     summary: Authenticate
 *     responses:
 *       200:
 *         description: Ok. This device exists
 *       401:
 *         description: Not exist in our DB or JWT token is invalid
 */
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  res.status(StatusCodes.OK).json({});
}

export default methodAllowedHandler(
  jwtVerificationHandler(deviceAuthorizationHandler(handler as any)),
  [HTTPMethod.POST, HTTPMethod.GET]
);
