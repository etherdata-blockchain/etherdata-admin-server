import {
  methodAllowedHandler,
  jwtVerificationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { dbServices } from "@etherdata-blockchain/services";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Search devices by keyword
 * @param req
 * @param res
 * @returns
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;

  if (key?.length === 0) {
    res.status(StatusCodes.OK).json([]);
    return;
  }

  const storageManagementService = new dbServices.StorageManagementService();
  const devices = await storageManagementService.search(key as string);

  if (devices) {
    res.status(StatusCodes.OK).json(devices.slice(0, 20));
    return;
  } else {
    res.status(StatusCodes.OK).json([]);
    return;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
]);
