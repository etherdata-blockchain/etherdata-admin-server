import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { dbServices } from "@etherdata-blockchain/services";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

interface Data {}

/**
 * @swagger
 * /api/v2/owner:
 *   name: Get list of owners
 *   get:
 *     summary: Get list of owners
 *     tags: ["Owner"]
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: "object"
 *       404:
 *         description: Not found
 *
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { page } = req.query;

  const currentPage = parseInt((page as string) ?? "1");
  const storageManagementOwnerService =
    new dbServices.StorageManagementOwnerService();

  const users = await storageManagementOwnerService.getListOfUsers(currentPage);
  res.status(StatusCodes.OK).send(users);
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
]);
