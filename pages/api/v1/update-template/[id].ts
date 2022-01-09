import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StatusCodes } from "http-status-codes";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";
import { UpdateScriptPlugin } from "../../../../internal/services/dbServices/update-script-plugin";
import { IUpdateTemplate } from "../../../../internal/services/dbSchema/update-template/update-template";

type Response = { err?: string; message?: string } | IUpdateTemplate | any;

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
  const updateScriptPlugin = new UpdateScriptPlugin();
  const script = await updateScriptPlugin.getUpdateTemplateWithDockerImage(
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
      const patchResult = await updateScriptPlugin.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await updateScriptPlugin.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
