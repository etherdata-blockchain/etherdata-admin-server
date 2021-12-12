import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  DockerImageModel,
  IDockerImage,
} from "../dbSchema/docker/docker-image";

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
}
