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
import { StringReplacer } from "@etherdata-blockchain/string-replacer";
import { getReplacementMap } from "../../../../../internal/const/replacement_map";

type Response =
  | { err?: string; message?: string }
  | interfaces.PaginationResult<schema.IInstallationTemplate>
  | Buffer;

/**
 * @swagger
 * /api/v1/installation-template/download:
 *   name: Download the installation template
 *   post:
 *      tags: ["Installation Template"]
 *      description: Update the given installation template
 *      summary: Update the given installation template
 *      parameters:
 *        - name: envs
 *          type: object
 *          in: body
 *          description: Expect to be a key value pair's map.
 *        - name: template
 *          type: string
 *          in: body
 *          description: template id
 *      responses:
 *        200:
 *          description: ok
 *          schema:
 *            type: object
 *            $ref: "#/definitions/InstallationTemplateDBInterface"
 *        404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *   delete:
 *      tags: ["Installation Template"]
 *      description: Delete the given installation template
 *      summary: Delete the given installation template
 *      responses:
 *        200:
 *          description: ok
 *        404:
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: string
 *               description: Error reason
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const installationService = new dbServices.InstallationService();
  const staticNodeService = new dbServices.StaticNodeService();
  const { user } = req.body;
  const https =
    req.headers["x-forwarded-proto"] || req.headers.referer?.split("://")[0];
  const url = `${https}://${req.headers.host}`;

  const replacementMap = getReplacementMap({
    nodeName: user,
    nodeId: user,
    host: url,
  });
  const stringReplacer = new StringReplacer(replacementMap);

  /**
   * Handle get request. Will try to find template by template tag
   * and generate a zip file contains all required files
   */
  const handlePostRequest = async () => {
    const templateTag = req.body.template;
    const envs = req.body.envs;
    const template = await installationService.filter(
      {
        template_tag: templateTag,
      },
      1,
      1
    );
    //TODO: Added random pick function
    const staticNodes = await staticNodeService.list(
      configs.Configurations.defaultPaginationStartingPage,
      configs.Configurations.numberPerPage
    );

    if (template?.count === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ err: "Cannot find a template with name: " + templateTag });
      return;
    }

    const zip = new AdmZip();
    let templateWithDockerCompose: any =
      await installationService.getTemplateWithDockerImages(
        template!.results[0].id
      );

    templateWithDockerCompose = stringReplacer.replaceObject(
      templateWithDockerCompose!
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
    res.status(StatusCodes.OK).send(data);
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
