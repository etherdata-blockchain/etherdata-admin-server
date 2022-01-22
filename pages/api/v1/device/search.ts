import type {NextApiRequest, NextApiResponse} from "next";
import HTTPMethod from "http-method-enum";
import {StatusCodes} from "http-status-codes";
import {dbServices} from "@etherdata-blockchain/services";
import {jwtVerificationHandler, methodAllowedHandler,} from "@etherdata-blockchain/next-js-handlers";

/**
 * Search devices by id
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;
  const storageManagementService = new dbServices.StorageManagementService();
  const devices = await storageManagementService.search(key as string);

  if (devices) {
    res.status(StatusCodes.OK).json(devices);
  } else {
    res.status(StatusCodes.NOT_FOUND).json({ reason: "" });
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
