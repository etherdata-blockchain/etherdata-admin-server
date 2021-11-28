import type { NextApiRequest, NextApiResponse } from "next";
import { InstallScriptService } from "../../../../services/installScript/installScript";
import AdmZip from "adm-zip";
import { postOnlyMiddleware } from "../../../../utils/nextHandler/postOnlyHandler";

/**
 * Health checking
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { env } = req.body;

  const installScriptService = new InstallScriptService(env);
  const zip = new AdmZip();

  zip.addFile(
    "docker-compose.yml",
    Buffer.from(installScriptService.generateDockerComposeFile(), "utf-8")
  );

  zip.addFile(
    "env",
    Buffer.from(installScriptService.generateEnvFile()),
    "utf-8"
  );

  const data = zip.toBuffer();
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "content-disposition",
    "attachment; filename=installation-script.zip"
  );
  res.send(data);
}

export default postOnlyMiddleware(handler);
