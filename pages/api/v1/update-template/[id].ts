import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.UpdateTemplateDBInterface
  | any;

/**
 * This will handle update template by id
 *
 * - **Patch**: will update a specific update template
 * - **Delete**: Will try to delete an update template
 * - **Get**: Will try to return the template by id
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const id = req.query.id;
  const updateTemplateService = new dbServices.UpdateTemplateService();
  const script = await updateTemplateService.getUpdateTemplateWithDockerImage(
    id as string
  );
  if (script === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find update script with id: ${id}` });
    return;
  }

  const data = {
    ...req.body,
    _id: id,
  };

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json(script);
      break;

    case "PATCH":
      const patchResult = await updateTemplateService.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await updateTemplateService.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
