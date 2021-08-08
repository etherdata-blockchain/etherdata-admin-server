import type { NextApiRequest, NextApiResponse } from "next";
import { PostOnlyMiddleware } from "../../../../utils/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../server/plugin/plugins/deviceRegistrationPlugin";
import { JwtVerificationHandler } from "../../../../utils/nextHandler/jwtVerificationHandler";

type Data = {
  success: boolean;
  reason?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, device } = req.body;

  try {
    let plugin = new DeviceRegistrationPlugin();
    let [success, reason] = await plugin.register(user, device);

    res.status(201).json({ success: success, reason: reason });
  } catch (err) {
    res.status(500).json({ success: false, reason: err.toString() });
  }
}

export default PostOnlyMiddleware(JwtVerificationHandler(handler));
