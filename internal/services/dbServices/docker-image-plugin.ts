import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  DockerImageModel,
  IDockerImage,
} from "../dbSchema/docker/docker-image";
import { UpdateScriptModel } from "../dbSchema/update-template/update_script";
import { Configurations } from "../../const/configurations";

interface DockerWebhook {
  // eslint-disable-next-line camelcase
  callback_url: string;
  // eslint-disable-next-line camelcase
  push_data: PushData;
  repository: Repository;
}

interface PushData {
  images: string[];
  // eslint-disable-next-line camelcase
  pushed_at: number;
  pusher: string;
  tag: string;
}

interface Repository {
  // eslint-disable-next-line camelcase
  comment_count: number;
  // eslint-disable-next-line camelcase
  date_created: number;
  description: string;
  dockerfile: string;
  // eslint-disable-next-line camelcase
  full_description: string;
  // eslint-disable-next-line camelcase
  is_official: boolean;
  // eslint-disable-next-line camelcase
  is_private: boolean;
  // eslint-disable-next-line camelcase
  is_trusted: boolean;
  name: string;
  namespace: string;
  owner: string;
  // eslint-disable-next-line camelcase
  repo_name: string;
  // eslint-disable-next-line camelcase
  repo_url: string;
  // eslint-disable-next-line camelcase
  star_count: number;
  status: string;
}

/**
 * Docker image db plugin
 */
export class DockerImagePlugin extends DatabasePlugin<IDockerImage> {
  pluginName: PluginName = "dockerImage";
  protected model: Model<IDockerImage> = DockerImageModel;

  /**
   * Will delete corresponding update-script script
   * @param data
   */
  async delete(id: any) {
    const deletePromise = UpdateScriptModel.updateOne(
      { "imageStacks.image": id },
      { $pull: { imageStacks: { image: id } } }
    ).exec();

    const deletePromise2 = UpdateScriptModel.updateOne(
      { "containerStacks.image.image": id },
      { $unset: { "containerStacks.$.image": 0 } }
    ).exec();
    await Promise.all([deletePromise, deletePromise2]);
    return super.delete(id);
  }

  /**
   * Create data with webhook data from docker hub
   * @param {DockerWebhook} data data from webhook
   */
  async createWithDockerWebhookData(data: DockerWebhook): Promise<void> {
    const dockerData = {
      imageName: data.repository.repo_name,
      tags: [{ tag: data.push_data.tag }],
      selectedTag: undefined,
      selected: false,
    };

    const prevImage = await this.model
      .findOne({ imageName: data.repository.repo_name })
      .exec();
    if (prevImage) {
      await this.model.updateOne(
        { imageName: data.repository.repo_name },
        { $push: { tags: { tag: data.push_data.tag } } }
      );
    } else {
      await this.model.create(dockerData);
    }
  }

  /**
   * Search docker images by image name
   * @param{string} key
   */
  async search(key: string): Promise<IDockerImage[]> {
    const query = this.model
      .find({ imageName: { $regex: ".*" + key + ".*" } })
      .limit(Configurations.numberPerPage);
    return query.exec();
  }

  // /**
  //  * Get a list of images by id
  //  * @param imageIds
  //  */
  // async listImagesByTagIds(imageIds: string[]): Promise<IDockerImage[]> {
  //   const query = this.model.find({});
  // }
}
