import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  IInstallationTemplate,
  InstallationTemplateModel,
} from "../dbSchema/install-script/install-script";
import YAML from "yaml";
import {
  DockerImageModel,
  IDockerImage,
} from "../dbSchema/docker/docker-image";
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
   * Generate an env file from envs.
   * For example, if an envs looks like this:
   * {name: "Hello", value: "123"},
   * then the generated content will be
   * name=Hello
   * value=123
   * @param{any} envs
   */
  generateEnvFile(envs: { [key: string]: any }): string {
    let content = "";
    for (const [key, value] of Object.entries(envs)) {
      content += `${key}=${value}\n`;
    }
    return content;
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

  /**
   * Get template with docker images.
   * This will turn a docker image version id into a docker image object
   * @param{string} id template id
   */
  async getTemplateWithDockerImages(
    id: string
  ): Promise<IInstallationTemplate | undefined> {
    const template = await this.model.findOne({ _id: id }).exec();
    if (template) {
      const object = template.toJSON();
      const imageIds = Object.values(object.services).map((s) => s.image);
      const images: IDockerImage[] = await DockerImageModel.find({
        "tags._id": { $in: imageIds },
      }).exec();
      const outputImages: any[] = [];
      for (const image of images) {
        for (const tag of image.toJSON().tags) {
          const found = imageIds.find(
            (t) => t.toString() === tag._id?.toString()
          );
          if (found) {
            const dockerImage: any = image;
            dockerImage.tag = tag;
            dockerImage.tags = [tag];
            outputImages.push(dockerImage);
            break;
          }
        }
      }
      const templateJSON = template.toJSON();
      for (const [key, value] of Object.entries(templateJSON.services)) {
        for (const image of outputImages) {
          if (image.tag._id.toString() === value.image.toString()) {
            value.image = image.toJSON();
            templateJSON.services[key] = value;
          }
        }
      }

      return templateJSON as unknown as IInstallationTemplate;
    }

    return undefined;
  }
}
