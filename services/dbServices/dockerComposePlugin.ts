import { DatabasePlugin } from "../../server/plugin/basePlugin";
import { PluginName } from "../../server/plugin/pluginName";
import { Model } from "mongoose";
import { DockerComposeModel, IDockerCompose } from "../dbSchema/docker-compose";

/**
 * Docker image db plugin
 */
export class DockerComposePlugin extends DatabasePlugin<IDockerCompose> {
  pluginName: PluginName = "dockerCompose";
  protected model: Model<IDockerCompose> = DockerComposeModel;
}
