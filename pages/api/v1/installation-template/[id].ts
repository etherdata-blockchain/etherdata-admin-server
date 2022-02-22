import type { NextApiRequest, NextApiResponse } from "next";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { StatusCodes } from "http-status-codes";

import HTTPMethod from "http-method-enum";

type Response =
  | { err?: string; message?: string }
  | interfaces.db.InstallationTemplateDBInterface;

/**
 * This will handle installation template request by id.
 *
 * - **Patch**: will update specific installation template
 * - **Delete**: Will try to delete a template
 * - **Get**: Will try to return the template by id
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const id = req.query.id;
  const installationService = new dbServices.InstallationService();
  const template = await installationService.get(id as string);
  if (template === undefined) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ err: `Cannot find template with id: ${id}` });
    return;
  }

  const data = {
    ...req.body,
    _id: id,
  };

  switch (req.method) {
    case HTTPMethod.GET:
      res.status(StatusCodes.OK).json(template);
      break;

    case HTTPMethod.PATCH:
      const patchResult = await installationService.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case HTTPMethod.DELETE:
      await installationService.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler as any), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
