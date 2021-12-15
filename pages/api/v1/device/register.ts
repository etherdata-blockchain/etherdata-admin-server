import type { NextApiRequest, NextApiResponse } from "next";
import { postOnlyMiddleware } from "../../../../internal/nextHandler/postOnlyHandler";
import { DeviceRegistrationPlugin } from "../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";

type Data = {
  success: boolean;
  reason?: string;
};

/**
 * Handle device register request.
 * When user submit a register device,
 * this handler will try to find the matched device,
 * and try to register the user info in the database
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user, device } = req.body;

  const plugin = new DeviceRegistrationPlugin();
  const [success, reason] = await plugin.register(device, user);
  if (success) {
    res.status(201).json({ success: success, reason: reason });
  } else {
    res.status(500).json({ success: success, reason: reason });
  }
}

export default postOnlyMiddleware(jwtVerificationHandler(handler));
