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

  let plugin = new DeviceRegistrationPlugin();
  let [success, reason] = await plugin.register(device, user);
  if (success) {
    res.status(201).json({ success: success, reason: reason });
  } else {
    res.status(500).json({ success: success, reason: reason });
  }
}

export default PostOnlyMiddleware(JwtVerificationHandler(handler));
