import {DatabasePlugin} from "../../../server/plugin/basePlugin";
import {PluginName} from "../../../server/plugin/pluginName";
import {Model} from "mongoose";
import {IInstallationTemplate, InstallationTemplateModel} from "../dbSchema/install-script/install-script";
import YAML from "yaml";
import {DockerImageModel} from "../dbSchema/docker/docker-image";
import Logger from "../../../server/logger";

/**
 * Installation template plugin
 */
export class InstallationPlugin extends DatabasePlugin<IInstallationTemplate> {
  pluginName: PluginName = "installScript";
  protected model: Model<IInstallationTemplate> = InstallationTemplateModel;

  /**
   * Generate a docker-compose file based on the installation template
   * @param{IInstallationTemplate} installationTemplate
   * @return {string} generated docker compose file in yaml format
   */
  generateDockerComposeFile(
    installationTemplate: IInstallationTemplate
  ): string {
    const deepCopiedTemplate = JSON.parse(JSON.stringify(installationTemplate));
    delete deepCopiedTemplate.created_by;
    delete deepCopiedTemplate.template_tag;

    return YAML.stringify(deepCopiedTemplate);
  }

  /**
   * Validate if image exist.
   * @param{IInstallationTemplate} data
   * @param{boolean} upsert
   */
  async createWithValidation(
    data: IInstallationTemplate,
    { upsert }: { upsert: boolean }
  ): Promise<IInstallationTemplate | undefined> {
    const imageIds = Object.values(data.services).map(
      (v) => v.image as unknown as string
    );
    const foundIdsNumber = await DockerImageModel.countDocuments({
      "tags._id": { $in: imageIds },
    }).exec();
    if (foundIdsNumber !== imageIds.length) {
      Logger.error("Some id doesn't exist");
      return undefined;
    }

    return super.create(data, { upsert });
  }
}
