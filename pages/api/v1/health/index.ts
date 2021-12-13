import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Health checking
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({});
}

export default handler;
