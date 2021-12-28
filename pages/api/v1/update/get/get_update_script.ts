import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import Logger from "../../../../../server/logger";
import { IUpdateScript } from "../../../../../internal/services/dbSchema/update_script";
import { UpdateScriptPlugin } from "../../../../../internal/services/dbServices/UpdateScriptPlugin";

type Data = {
    error?: string;
    updateScript?: IUpdateScript;
    key?: string;
};

/**
 * Get a update_script from DB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { user: deviceId, key } = req.body;
    const returnData: Data = {};

    try {
        const plugin = new UpdateScriptPlugin();
        const devicePlugin = new DeviceRegistrationPlugin();
        const [authorized, newKey] = await devicePlugin.auth(deviceId, key);
        if (authorized) {
            returnData.updateScript = await plugin.getUpdateScript(deviceId);
            returnData.key = newKey;
            res.status(200).json(returnData);
        } else {
            Logger.error("Device is not in our DB");
            returnData.error = "Device is not in our DB";
            res.status(500).json(returnData);
        }
    } catch (err) {
        Logger.error(err);
        // @ts-ignore
        returnData.error = err;
        res.status(500).json(returnData);
    }
}

export default jwtVerificationHandler(handler);
