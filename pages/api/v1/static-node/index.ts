import type {NextApiRequest, NextApiResponse} from "next";
import {StatusCodes} from "http-status-codes";
import HTTPMethod from "http-method-enum";
import {dbServices} from "@etherdata-blockchain/services";
import {jwtVerificationHandler, methodAllowedHandler, paginationHandler,} from "@etherdata-blockchain/next-js-handlers";

/**
 * Sttaic node api will provide follow functionalities
 * - **post**: Create a new static node
 * - **get**: List static nodes by page number and page size
 * @param{NextApiRequest} req
 * @param{NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staticNodeService = new dbServices.StaticNodeService();
  switch (req.method) {
    case "GET":
      const { page, pageSize } = req.body;
      const result = await staticNodeService.list(page, pageSize);
      res.status(StatusCodes.OK).json(result);
      break;
    case "POST":
      await staticNodeService.create(req.body, { upsert: false });
      res.status(StatusCodes.CREATED).json({});
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
