import type { NextApiRequest, NextApiResponse } from "next";
import AdmZip from "adm-zip";

import HTTPMethod from "http-method-enum";

import { IInstallationTemplate } from "../../../../../internal/services/dbSchema/install-script/install-script";
import { InstallationPlugin } from "../../../../../internal/services/dbServices/installation-plugin";
import { StatusCodes } from "http-status-codes";
import { methodAllowedHandler } from "../../../../../internal/nextHandler/method_allowed_handler";
import { paginationHandler } from "../../../../../internal/nextHandler/paginationHandler";
import { jwtVerificationHandler } from "../../../../../internal/nextHandler/jwt_verification_handler";
import { StaticNodePlugin } from "../../../../../internal/services/dbServices/static-node-plugin";
import { Configurations } from "../../../../../internal/const/configurations";
import { PaginationResult } from "../../../../../internal/const/common_interfaces";

type Response =
  | { err?: string; message?: string }
  | PaginationResult<IInstallationTemplate>
  | Buffer;

/**
 * This will handle installation template request.
 * - **Post**: Will create a zip file for download.
 * if try to get a zip file using POST request, then a list of env query parameters in body is expected.
 * The env could look like this. {envs: [{name: "hello", age: 24}]}
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const installScriptPlugin = new InstallationPlugin();
  const staticNodePlugins = new StaticNodePlugin();

  /**
   * Handle get request. Will try to find template by template tag
   * and generate a zip file contains all required files
   */
  const handlePostRequest = async () => {
    const templateName = req.body.template;
    const envs = req.body.envs;
    const template = await installScriptPlugin.filter(
      {
        template_tag: templateName,
      },
      1,
      1
    );
    //TODO: Added random pick function
    const staticNodes = await staticNodePlugins.list(
      1,
      Configurations.numberPerPage
    );

    if (template?.count === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "Cannot find a template with name: " + templateName });
      return;
    }

    const zip = new AdmZip();
    await installScriptPlugin.getTemplateWithDockerImages(
      template!.results[0].id
    );
    const templateWithDockerCompose =
      await installScriptPlugin.getTemplateWithDockerImages(
        template!.results[0].id
      );

    zip.addFile(
      "docker-compose.yml",
      Buffer.from(
        installScriptPlugin.generateDockerComposeFile(
          templateWithDockerCompose!
        ),
        "utf-8"
      )
    );

    if (envs) {
      zip.addFile(
        ".env",
        Buffer.from(installScriptPlugin.generateEnvFile(envs), "utf-8")
      );
    }

    if (staticNodes) {
      zip.addFile(
        "static-nodes.json",
        Buffer.from(
          staticNodePlugins.staticNodesToJSON(staticNodes.results),
          "utf-8"
        )
      );
    }

    const data = zip.toBuffer();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "content-disposition",
      "attachment; filename=installation-template-script.zip"
    );
    res.send(data);
  };

  switch (req.method) {
    case "POST":
      await handlePostRequest();
      break;
  }
}

export default methodAllowedHandler(
  jwtVerificationHandler(paginationHandler(handler)),
  [HTTPMethod.POST]
);
