import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import HTTPMethod from "http-method-enum";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { getReplacementMap } from "../../../../internal/const/replacement_map";
import { StringReplacer } from "@etherdata-blockchain/string-replacer";

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
  const { user } = req.body;
  const updateTemplateService = new dbServices.UpdateTemplateService();
  let script: any =
    await updateTemplateService.getUpdateTemplateWithDockerImage(id as string);
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

  const https =
    req.headers["x-forwarded-proto"] || req.headers.referer?.split("://")[0];
  const url = `${https}://${req.headers.host}`;

  const replacementMap = getReplacementMap({
    nodeName: user,
    nodeId: user,
    host: url,
  });
  const stringReplacer = new StringReplacer(replacementMap);

  switch (req.method) {
    case "GET":
      script = stringReplacer.replaceObject(script!);
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
