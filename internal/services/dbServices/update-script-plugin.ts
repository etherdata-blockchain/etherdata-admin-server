import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { Model } from "mongoose";
import { PluginName } from "../../../server/plugin/pluginName";
import {
  IUpdateScript,
  UpdateScriptModel,
} from "../dbSchema/update-template/update_script";

// eslint-disable-next-line require-jsdoc
export class UpdateScriptPlugin extends DatabasePlugin<IUpdateScript> {
  protected model: Model<IUpdateScript> = UpdateScriptModel;
  pluginName: PluginName = "updateScript";

  /**
   * Will replace docker image tag id by real docker image
   */
  async getUpdateTemplateWithDockerImage(): Promise<IUpdateScript> {
    const pipeline: any[] = [
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
          $expr: {
            $eq: ["$containerStacks.image.tag", "$container.tags._id"],
          },
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
          targetDeviceId: 1,
          targetGroupId: 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          targetDeviceId: { $first: "$targetDeviceId" },
          targetGroupId: { $first: "$targetGroupId" },
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
    const result = this.model.aggregate([
      pipeline[0],
      pipeline[1],
      pipeline[2],
      pipeline[3],
      pipeline[4],
      pipeline[5],
      pipeline[6],
      pipeline[7],
      pipeline[8],
      pipeline[9],
      pipeline[10],
      pipeline[11],
    ]);
    return (await result.exec())[0];
  }
}
