import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { JwtVerificationHandler } from "../../../../utils/nextHandler/jwtVerificationHandler";
import { IDevice } from "../../../../server/schema/device";

type Data = {
    err?: string
};

/**
 * Health checking
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({})
}

export default handler;
