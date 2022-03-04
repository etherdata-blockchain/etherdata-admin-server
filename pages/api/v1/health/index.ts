import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";

/**
 * @swagger
 * /api/v1/health:
 *   name: Health checking
 *   post:
 *     tags: ["Health"]
 *     description: Returns a 200 result
 *     responses:
 *       200:
 *         description: Server is up.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(StatusCodes.OK).json({});
}

export default handler;
