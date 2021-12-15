import type {NextApiRequest, NextApiResponse} from "next";
import {jwtVerificationHandler} from "../../../../internal/nextHandler/jwt_verification_handler";
import {StaticNodePlugin} from "../../../../internal/services/dbServices/static-node-plugin";
import {paginationHandler} from "../../../../internal/nextHandler/paginationHandler";
import {StatusCodes} from "http-status-codes";
import {methodAllowedHandler} from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";

/**
 * Sttaic node api will provide follow functionalities
 * - **post**: Create a new static node
 * - **get**: List static nodes by page number and page size
 * @param{NextApiRequest} req
 * @param{NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staticNodePlugin = new StaticNodePlugin();
  switch (req.method) {
    case "GET":
      const { page, pageSize } = req.body;
      const result = await staticNodePlugin.list(page, pageSize);
      res.status(StatusCodes.OK).json(result);
      break;
    case "POST":
      await staticNodePlugin.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
