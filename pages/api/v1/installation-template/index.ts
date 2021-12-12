import type { NextApiRequest, NextApiResponse } from "next";
import AdmZip from "adm-zip";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { paginationHandler } from "../../../../internal/nextHandler/paginationHandler";
import { InstallScriptPlugin } from "../../../../internal/services/dbServices/install-script-plugin";
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
 * - **Post**: Will create a new template based on user request
 * - **Get**: Will either get template by template_tag or list templates
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const installScriptPlugin = new InstallScriptPlugin();

  /**
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
    await installScriptPlugin.create(data, { upsert: false });
    res.status(StatusCodes.CREATED).json({ message: "OK" });
  };

  switch (req.method) {
    case "GET":
      if (req.query.template) {
        await handleGetRequest();
      } else {
        await handleListRequest();
      }
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
