import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  InstallScriptModel,
  IInstallScript,
} from "../dbSchema/install-script/install-script";

/**
 * Docker image db plugin
 */
export class InstallScriptPlugin extends DatabasePlugin<IInstallScript> {
  pluginName: PluginName = "dockerCompose";
  protected model: Model<IInstallScript> = InstallScriptModel;
}
