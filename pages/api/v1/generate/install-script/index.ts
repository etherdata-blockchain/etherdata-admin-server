import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Generate install zip for end device
 * 1. Will generate a docker-compose file
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({});
}

export default handler;
