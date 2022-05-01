import type { NextApiRequest, NextApiResponse } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { configs, interfaces } from "@etherdata-blockchain/common";

type Data =
  | {
      reason?: string;
    }
  | interfaces.db.StorageUserDBInterface;

/**
 * @swagger
 * /api/v1/device/edit/owner/[id]:
 *   name: Edit, get ,or delete owner's info
 *   post:
 *     summary: Edit owner's info
 *     tags: ["Device"]
 *     parameters:
 *       - name: Owner data
 *         in: body
 *         type: object
 *         required: true
 *         schema:
 *           $ref: "#/definitions/StorageUserDBInterface"
 *     responses:
 *        201:
 *          description: Created
 *        500:
 *          description: Internal server error
 *        400:
 *          description: Missing required info
 *        401:
 *          description: JWT token is invalid
 *        404:
 *          description: No such owner
 *   get:
 *     summary: Get owner's info
 *     tags: ["Device"]
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: "object"
 *           $ref: "#/definitions/StorageUserDBInterface"
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete owner
 *     tags: ["Device"]
 *     responses:
 *       202:
 *         description: Deleted
 *       404:
 *         description: No such owner
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { id } = req.query;
  const service = new dbServices.StorageManagementOwnerService();
  const owners = await service.filter(
    { user_id: id },
    configs.Configurations.defaultPaginationStartingPage,
    1
  );

  if (owners?.count === 0) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  /**
   * Handle patch
   */
  async function handlePatch() {
    const data = req.body;
    const owner = owners!.results[0];
    await service.patch({ _id: owner._id, ...data });
    res.status(StatusCodes.CREATED).json({});
  }

  /**
   * Handle get
   */
  async function handleGet() {
    res.status(StatusCodes.OK).json(owners!.results[0]);
  }

  /**
   * Handle delete
   */
  async function handleDelete() {
    const owner = owners!.results[0];
    await service.delete(owner._id);
    res.status(StatusCodes.ACCEPTED).json({});
  }

  switch (req.method) {
    case HTTPMethod.GET:
      await handleGet();
      break;
    case HTTPMethod.DELETE:
      await handleDelete();
      break;
    case HTTPMethod.PATCH:
      await handlePatch();
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.PATCH,
  HTTPMethod.GET,
  HTTPMethod.DELETE,
]);
