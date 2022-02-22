import type { NextApiRequest, NextApiResponse } from "next";
import AdmZip from "adm-zip";
import HTTPMethod from "http-method-enum";
import { StatusCodes } from "http-status-codes";
import { configs, interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jwtVerificationHandler,
  methodAllowedHandler,
  paginationHandler,
} from "@etherdata-blockchain/next-js-handlers";
import { schema } from "@etherdata-blockchain/storage-model";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IInstallationTemplate>
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
  const installationService = new dbServices.InstallationService();
  const staticNodeService = new dbServices.StaticNodeService();

  /**
   * Handle get request. Will try to find template by template tag
   * and generate a zip file contains all required files
   */
  const handlePostRequest = async () => {
    const templateName = req.body.template;
    const envs = req.body.envs;
    const template = await installationService.filter(
      {
        template_tag: templateName,
      },
      1,
      1
    );
    //TODO: Added random pick function
    const staticNodes = await staticNodeService.list(
      1,
      configs.Configurations.numberPerPage
    );

    if (template?.count === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "Cannot find a template with name: " + templateName });
      return;
    }

    const zip = new AdmZip();
    const templateWithDockerCompose =
      await installationService.getTemplateWithDockerImages(
        template!.results[0].id
      );

    zip.addFile(
      "docker-compose.yml",
      Buffer.from(
        installationService.generateDockerComposeFile(
          templateWithDockerCompose!
        ),
        "utf-8"
      )
    );

    if (envs) {
      zip.addFile(
        ".env",
        Buffer.from(installationService.generateEnvFile(envs), "utf-8")
      );
    }

    if (staticNodes) {
      zip.addFile(
        "static-nodes.json",
        Buffer.from(
          staticNodeService.staticNodesToJSON(staticNodes.results),
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
  jwtVerificationHandler(paginationHandler(handler as any)),
  [HTTPMethod.POST]
);
