import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { InstallationPlugin } from "../../../../internal/services/dbServices/installation-plugin";
import { StatusCodes } from "http-status-codes";
import { IInstallationTemplate } from "../../../../internal/services/dbSchema/install-script/install-script";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";

type Response = { err?: string; message?: string } | IInstallationTemplate;

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
  const installScriptPlugin = new InstallationPlugin();
  const template = await installScriptPlugin.get(id as string);
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
    case "GET":
      res.status(StatusCodes.OK).json(template);
      break;

    case "PATCH":
      const patchResult = await installScriptPlugin.create(data, {
        upsert: true,
      });
      res.status(StatusCodes.OK).json(patchResult!);
      break;

    case "DELETE":
      await installScriptPlugin.delete(data);
      res.status(StatusCodes.OK).json({ message: "OK" });
      break;
  }
}

export default methodAllowedHandler(jwtVerificationHandler(handler), [
  HTTPMethod.GET,
  HTTPMethod.PATCH,
  HTTPMethod.DELETE,
]);
