import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { postOnlyMiddleware } from "../../../../internal/nextHandler/postOnlyHandler";
import Logger from "../../../../server/logger";
import { IUpdateScript, UpdateScriptModel } from "../../../../internal/services/dbSchema/update_script";
import { UpdateScriptPlugin } from "../../../../internal/services/dbServices/UpdateScriptPlugin";

type Data = {
    error?: string;
    success?: boolean;
    key?: string;
};

/**
 * create a update_script in MongoDB
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const {user: deviceId, key, type, imageName, imageTag, containerName, env} = req.body;
    const returnData: Data = {};

    try {
        const plugin = new UpdateScriptPlugin();
        const devicePlugin = new DeviceRegistrationPlugin();
        const [authorized, newKey] = await devicePlugin.auth(deviceId, key);
        if (authorized) {
            const updateScriptInfo: IUpdateScript = new UpdateScriptModel({
                targetDeviceId: deviceId,
                from: deviceId,
                time: new Date(),
                task: {
                    type: type,
                    imageName: imageName,
                    imageTag: imageTag,
                    containerName: containerName,
                    env: env,
                }}
            );
            returnData.key = newKey;
            returnData.success = await plugin.createUpdateScript(updateScriptInfo);
            if (returnData.success) {
                res.status(200).json(returnData);
            } else {
                Logger.error("Failed to create update_script");
                returnData.error = "Failed to create update_script";
                res.status(500).json(returnData);
            }
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

export default postOnlyMiddleware(jwtVerificationHandler(handler));
