import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  err?: string;
};

/**
 * Health checking
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({});
}

export default handler;
