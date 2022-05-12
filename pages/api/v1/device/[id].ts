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
  | interfaces.db.StorageItemDBInterface;

/**
 * @swagger
 * /api/v1/device/[id]:
 *   name: Edit, get ,or delete storage item
 *   post:
 *     summary: Edit item's info
 *     tags: ["Device"]
 *     parameters:
 *       - name: Item data
 *         in: body
 *         type: object
 *         required: true
 *         schema:
 *           $ref: "#/definitions/StorageItemDBInterface"
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
 *     summary: Get Item's info
 *     tags: ["Device"]
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: "object"
 *           $ref: "#/definitions/StorageItemDBInterface"
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete Item
 *     tags: ["Device"]
 *     responses:
 *       202:
 *         description: Deleted
 *       404:
 *         description: No such item
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { id } = req.query;
  const service = new dbServices.StorageManagementService();
  const item = await service.get(id as string);
  if (!item) {
    res.status(StatusCodes.NOT_FOUND).json({ reason: "Item not found" });
  }

  /**
   * Handle patch
   */
  async function handlePatch() {
    const data = req.body;
    await service.patch({ _id: item!._id, ...data });
    res.status(StatusCodes.CREATED).json({});
  }

  /**
   * Handle get
   */
  async function handleGet() {
    res.status(StatusCodes.OK).json(item!);
  }

  /**
   * Handle delete
   */
  async function handleDelete() {
    await service.delete(item!._id);
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
