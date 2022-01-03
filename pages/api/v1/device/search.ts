import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StorageManagementItemPlugin } from "../../../../internal/services/dbServices/storage-management-item-plugin";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";

/**
 * Search devices by id
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;
  const plugin = new StorageManagementItemPlugin();
  const devices = await plugin.search(key as string);

  if (devices) {
    res.status(StatusCodes.OK).json(devices);
  } else {
    res.status(StatusCodes.NOT_FOUND).json({ reason: "" });
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
