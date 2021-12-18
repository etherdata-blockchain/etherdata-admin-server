import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { Configurations } from "../const/configurations";


/**
 * Handle list requests with pagination. Only will do the pagination on Get request.
 * If the request is a get request, then it will include **page** and **pageSize** fields.
 * It will check if **page** and **pageSize** query parameter
 * in the request body. If not, the default value will be used.
 * @param {NextApiHandler} fn
 * @constructor
 */
export const paginationHandler =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const page = (req.query.page as string) ?? "0";
    const pageSize =
      (req.query.pageSize as string) ?? `${Configurations.numberPerPage}`;
    if (req.method !== "GET") {
      return fn(req, res);
    }

    try {
      const pageNumber = parseInt(page);
      const pageSizeNumber = parseInt(pageSize);
      req.body = {
        ...req.body,
        page: pageNumber,
        pageSize: pageSizeNumber,
      };
      return fn(req, res);
    } catch (e) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ err: "Cannot parse pagination request" });
    }
  };
