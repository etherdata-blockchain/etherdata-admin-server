import type { NextApiRequest, NextApiResponse } from "next";
import moment from "moment";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { StatusCodes } from "http-status-codes";
import {
  deviceAuthorizationHandler,
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import requestIp from "request-ip";
import { interfaces } from "@etherdata-blockchain/common";

type Data = {
  error?: string;
  data?: schema.IDevice;
  key?: string;
};

/**
 * @swagger
 * /api/v1/device/status/send-status:
 *   name: Send device status to the server
 *   post:
 *     tags: ["Device"]
 *     description: Sends the latest status info to the server
 *     summary: Sends status to server
 *     parameters:
 *       - name: status data
 *         in: body
 *         type: object
 *         required: true
 *         schema:
 *           $ref: "#/definitions/DeviceDBInterface"
 *     responses:
 *       200:
 *         description: Ok.
 *         schema:
 *           type: "object"
 *           properties:
 *             key:
 *                 type: string
 *                 description: jwt key for next request
 *
 *             data:
 *                 type: object
 *                 schema:
 *                      $ref: "#/definitions/DeviceDBInterface"
 *       401:
 *         description: The given user is not authenticated
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user: nodeId, key, ...data } = req.body;
  const clientIp = requestIp.getClientIp(req);

  const plugin = new dbServices.DeviceRegistrationService();
  const lastSeen = moment().toDate();
  const deviceData: interfaces.db.DeviceDBInterface = {
    lastSeen: lastSeen,
    //@ts-ignore
    id: nodeId,
    ...data,
    networkSettings: {
      remoteIpAddress: clientIp,
      ...data.networkSettings,
    },
  };

  const responseData = await plugin.patch(deviceData as schema.IDevice);
  res.status(StatusCodes.OK).json({ data: responseData, key: key });
}

export default methodAllowedHandler(
  jwtVerificationHandler(deviceAuthorizationHandler(handler as any)),
  [HTTPMethod.POST]
);
