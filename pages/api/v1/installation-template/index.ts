import type { NextApiRequest, NextApiResponse } from "next";
<<<<<<< HEAD
import AdmZip from "adm-zip";
=======
>>>>>>> upstream/dev
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { paginationHandler } from "../../../../internal/nextHandler/paginationHandler";
import { InstallationPlugin } from "../../../../internal/services/dbServices/installation-plugin";
import { StatusCodes } from "http-status-codes";
import { IInstallationTemplate } from "../../../../internal/services/dbSchema/install-script/install-script";
import { PaginationResult } from "../../../../server/plugin/basePlugin";
import { methodAllowedHandler } from "../../../../internal/nextHandler/method_allowed_handler";
import HTTPMethod from "http-method-enum";

type Response =
  | { err?: string; message?: string }
  | PaginationResult<IInstallationTemplate>
  | Buffer;

/**
 * This will handle installation template request.
 *
<<<<<<< HEAD
 * - **Post**: Will create a new template based on user request
 * - **Get**: Will either get template by template_tag or list templates
=======
 * - **Post**: Will create a new template based on user request.
 * - **Get**: Will list templates
>>>>>>> upstream/dev
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const installScriptPlugin = new InstallationPlugin();

  /**
<<<<<<< HEAD
   * Handle get request. Will try to find template by template tag
   * and generate a zip file contains all required files
   */
  const handleGetRequest = async () => {
    const templateName = req.query.template;
    const template = await installScriptPlugin.filter(
      {
        template_tag: templateName,
      },
      0,
      1
    );

    if (template?.count === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "Cannot find a template with name: " + templateName });
      return;
    }

    const zip = new AdmZip();

    zip.addFile(
      "docker-compose.yml",
      Buffer.from(
        installScriptPlugin.generateDockerComposeFile(template!.results![0]),
        "utf-8"
      )
    );

    const data = zip.toBuffer();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "content-disposition",
      "attachment; filename=installation-template-script.zip"
    );
    res.send(data);
  };

  /**
=======
>>>>>>> upstream/dev
   * Will list templates by page number and page size
   */
  const handleListRequest = async () => {
    const { page, pageSize } = req.body;
    const results = await installScriptPlugin.list(page, pageSize);
    res.status(StatusCodes.OK).json(results!);
  };

  /**
   * Will create a template by user. Will automatically add user
   */
  const handlePostRequest = async () => {
    const { user } = req.body;

    const data = {
      ...req.body,
      created_by: user,
    };
<<<<<<< HEAD
    await installScriptPlugin.create(data, { upsert: false });
=======
    const result = await installScriptPlugin.createWithValidation(data, {
      upsert: false,
    });
    if (!result) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "image is not in docker image collection" });
      return;
    }
>>>>>>> upstream/dev
    res.status(StatusCodes.CREATED).json({ message: "OK" });
  };

  switch (req.method) {
    case "GET":
<<<<<<< HEAD
      if (req.query.template) {
        await handleGetRequest();
      } else {
        await handleListRequest();
      }
=======
      await handleListRequest();
>>>>>>> upstream/dev
      break;

    case "POST":
      await handlePostRequest();
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.GET, HTTPMethod.POST]
);
