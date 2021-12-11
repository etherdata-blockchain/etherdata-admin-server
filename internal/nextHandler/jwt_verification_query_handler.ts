import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

/**
 * Will verify the user token from query parameter.
 * Will read **token** from query if presents, otherwise will return 403
 * @param {NextApiRequest} fn
 * @constructor
 */
export const jwtVerificationQueryHandler =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const secret = process.env.PUBLIC_SECRET;
    const user = req.query.token as string;
    if (user === undefined) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ reason: "No token provided in query parameter" });
      return;
    }

    if (secret === undefined) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ reason: "PUBLIC_SECRET is not set in your environment" });
      return;
    }

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
