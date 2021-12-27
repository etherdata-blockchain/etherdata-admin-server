import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { Model } from "mongoose";
import { PluginName } from "../../../server/plugin/pluginName";
import {
  IUpdateScript,
  UpdateScriptModel,
} from "../dbSchema/update-template/update_script";

// eslint-disable-next-line require-jsdoc
export class StorageManagementItemPlugin extends DatabasePlugin<IUpdateScript> {
  protected model: Model<IUpdateScript> = UpdateScriptModel;
  pluginName: PluginName = "updateScript";

  /**
   * Will replace docker image tag id by real docker image
   */
  async getUpdateTemplateWithDockerImage() {}
}
