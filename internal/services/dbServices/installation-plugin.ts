import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  IInstallationTemplate,
  InstallationTemplateModel,
} from "../dbSchema/install-script/install-script";
import YAML from "yaml";
import { DockerImageModel } from "../dbSchema/docker/docker-image";
import Logger from "../../../server/logger";
import { postprocessData } from "../dbSchema/install-script/install-script-utils";

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
    const deepCopiedTemplate = JSON.parse(
      JSON.stringify(postprocessData(installationTemplate))
    );
    delete deepCopiedTemplate.created_by;
    delete deepCopiedTemplate.template_tag;
    delete deepCopiedTemplate.createdAt;
    delete deepCopiedTemplate.updatedAt;
    delete deepCopiedTemplate.__v;
    delete deepCopiedTemplate._id;
    for (const [key, val] of Object.entries(deepCopiedTemplate.services)) {
      //@ts-ignore
      if (val.image.tags) {
        // @ts-ignore
        val.image = `${val.image.imageName}:${val.image?.tags[0].tag}`;
      } else {
        // @ts-ignore
        val.image = `${val.image.imageName}:latest`;
      }

      // @ts-ignore
      delete val._id;
      deepCopiedTemplate.services[key] = val;
    }
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
    // @ts-ignore
    const imageIds = data.services.map((s) => s.service.image.tag);
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
    const pipeline: any[] = [
      {
        $unwind: {
          path: "$services",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "dockerimages",
          localField: "services.service.image.image",
          foreignField: "_id",
          as: "image",
        },
      },
      {
        $addFields: {
          image: {
            $first: "$image",
          },
        },
      },
      {
        $unwind: {
          path: "$image.tags",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $expr: {
            $eq: ["$services.service.image.tag", "$image.tags._id"],
          },
        },
      },
      {
        $addFields: {
          "image.tag": "$image.tags",
        },
      },
      {
        $addFields: {
          "services.service.image": "$image",
        },
      },
      {
        $unset: ["image", "services.service.image.tags"],
      },
      {
        $group: {
          _id: "_id",
          services: {
            $push: "$services",
          },
          version: {
            $first: "$version",
          },
          created_by: {
            $first: "$created_by",
          },
          template_tag: {
            $first: "$template_tag",
          },
        },
      },
    ];

    const query = this.model.aggregate(pipeline);
    const results: IInstallationTemplate[] = await query.exec();

    return results[0];
  }
}
