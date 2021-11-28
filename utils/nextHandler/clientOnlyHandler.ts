import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * client only handler. Only accept registered client using NEXT_PUBLIC_CLIENT_PASSWORD
 * @param fn
 * @constructor
 */
export const clientOnlyHandler =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const authorization = req.headers.authorization;
    if (authorization !== process.env.NEXT_PUBLIC_CLIENT_PASSWORD) {
      res.status(401).json({ reason: "Invalid client password" });
    } else {
      return fn(req, res);
    }
  };
