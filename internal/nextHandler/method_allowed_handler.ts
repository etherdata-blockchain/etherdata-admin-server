import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import {StatusCodes} from "http-status-codes";
import {HTTPMethod} from "http-method-enum";

/**
 * Post Only Middleware. Only accept post request.
 * Will authenticate user using Bearer token in the header
 * @param{NextApiRequest} fn
 * @param{HTTPMethod[]} allowedMethods allowed http methods
 * @constructor
 */
export const methodAllowedHandler =
  (fn: NextApiHandler, allowedMethods: HTTPMethod[]) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const found = allowedMethods.find((m) => m === req.method);
    if (!found) {
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ reason: `Only ${allowedMethods.join(",")} are allowed` });
      return;
    }
    return fn(req, res);
  };
