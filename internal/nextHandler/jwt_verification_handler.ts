import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import jwt from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";

/**
 * Post Only Middleware. Only accept post request.
 * Will authenticate user using Bearer token in the header
 * @param{NextApiRequest} fn
 * @constructor
 */
export const jwtVerificationHandler =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const secret = process.env.PUBLIC_SECRET;
    let user = req.headers.authorization;

    if (user === undefined) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ reason: "No token provided in header" });
      return;
    }

    if (secret === undefined) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ reason: "PUBLIC_SECRET is not set in your environment" });
      return;
    }

    user = user.replace("Bearer ", "");
    try {
      jwt.verify(user, secret);
      const data = jwt.decode(user, { json: true });
      req.body = {
        ...req.body,
        user: data!.user,
      };
      return fn(req, res);
    } catch (e) {
      console.log(e);
      res.status(403).json({ reason: "Not authorized" });
    }
  };
