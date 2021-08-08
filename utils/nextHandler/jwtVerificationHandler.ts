import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

/**
 * Post Only Middleware. Only accept post request
 * @param fn
 * @constructor
 */
export const JwtVerificationHandler =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    let secret = process.env.NEXT_PUBLIC_SECRET;
    let user = req.headers.authorization;
    if (user && secret) {
      user = user.replace("Bearer ", "");
      try {
        jwt.verify(user, secret);
        let data = jwt.decode(user, { json: true });
        req.body = {
          ...req.body,
          user: data!.user,
        };
        return fn(req, res);
      } catch (e) {
        res.status(403).json({ reason: "Not authorized" });
      }
    } else {
      res.status(403).json({ reason: "Not authorized" });
    }
  };
