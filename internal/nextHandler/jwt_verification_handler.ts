import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Environments } from "../const/environments";

/**
 * Post Only Middleware. Only accept post request.
 * Will authenticate user using Bearer token in the header.
 * If authenticated, then will include user in the request body
 * @param{NextApiRequest} fn
 * @constructor
 */
export const jwtVerificationHandler =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const secret = Environments.ServerSideEnvironments.PUBLIC_SECRET;
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
      res.status(StatusCodes.UNAUTHORIZED).json({ reason: "Not authorized" });
    }
  };
