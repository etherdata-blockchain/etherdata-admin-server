import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  DockerImageModel,
  IDockerImage,
} from "../dbSchema/docker/docker-image";

/**
 * Docker image db plugin
 */
export class DockerImagePluginPlugin extends DatabasePlugin<IDockerImage> {
  pluginName: PluginName = "dockerImage";
  protected model: Model<IDockerImage> = DockerImageModel;
}
