import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { Model, mongo } from "mongoose";
import { PluginName } from "../../../server/plugin/pluginName";

import { DockerContainerConfig } from "docker-plan/src/internal/stack/container";
import {
  IUpdateTemplate,
  UpdateScriptModel,
} from "../dbSchema/update-template/update-template";

interface UpdateImageStack {
  imageName: string;
  tags: { tag: string };
}

interface UpdateContainerStack {
  containerId?: string;
  containerName: string;
  image: UpdateImageStack;
  config?: DockerContainerConfig;
}

export interface IUpdateScriptWithDockerImage {
  _id: string;
  name: string;
  targetDeviceIds: string[];
  targetGroupIds: string[];
  from: string;
  imageStacks: UpdateImageStack[];
  containerStacks: UpdateContainerStack[];
}

// eslint-disable-next-line require-jsdoc
export class UpdateScriptPlugin extends DatabasePlugin<IUpdateTemplate> {
  protected model: Model<IUpdateTemplate> = UpdateScriptModel;
  pluginName: PluginName = "updateScript";

  /**
   * Will replace docker image tag id by real docker image.
   * Will return undefined when there is no such image
   */
  async getUpdateTemplateWithDockerImage(
    id: string
  ): Promise<IUpdateScriptWithDockerImage | undefined> {
    const pipeline: any[] = [
      {
        $match: {
          _id: new mongo.ObjectId(id),
        },
      },
      {
        $unwind: {
          path: "$imageStacks",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$containerStacks",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "dockerimages",
          localField: "imageStacks.image",
          foreignField: "_id",
          as: "image",
        },
      },
      {
        $lookup: {
          from: "dockerimages",
          localField: "containerStacks.image.image",
          foreignField: "_id",
          as: "container",
        },
      },
      {
        $unwind: {
          path: "$container",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$container.tags",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$image",
          preserveNullAndEmptyArrays: true,
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
          $or: [
            {
              $expr: {
                $eq: ["$containerStacks.image.tag", "$container.tags._id"],
              },
            },
            { imageStacks: { $exists: false } },
          ],
        },
      },
      {
        $match: {
          $expr: {
            $eq: ["$imageStacks.tag", "$image.tags._id"],
          },
        },
      },
      {
        $project: {
          image: 1,
          container: 1,
          containerStacks: 1,
          targetDeviceIds: 1,
          targetGroupIds: 1,
          name: 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          targetDeviceIds: { $first: "$targetDeviceIds" },
          targetGroupIds: { $first: "$targetGroupIds" },
          containerStacks: {
            $push: {
              $mergeObjects: [
                "$containerStacks",
                {
                  image: "$container",
                },
              ],
            },
          },
          imageStacks: {
            $push: "$image",
          },
        },
      },
    ];
    const result = this.model.aggregate(pipeline);
    const template = await result.exec();
    if (template.length === 0) {
      // @ts-ignore
      return await this.get(id);
    }
    return template[0];
  }
}
