import { DatabasePlugin } from "../../server/plugin/basePlugin";
import { PluginName } from "../../server/plugin/pluginName";
import { Model } from "mongoose";
import { IStaticNode, StaticNodeModel } from "../dbSchema/static-node";

/**
 * Docker image db plugin
 */
export class StaticNodePlugin extends DatabasePlugin<IStaticNode> {
  pluginName: PluginName = "staticNode";
  protected model: Model<IStaticNode> = StaticNodeModel;
}
