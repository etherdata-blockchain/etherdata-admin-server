import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Post Only Middleware. Only accept post request
 * @param fn
 * @constructor
 */
export const PostOnlyMiddleware =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
      return fn(req, res);
    } else {
      res.status(303).json({ reason: "This method only accept POST request" });
    }
  };
