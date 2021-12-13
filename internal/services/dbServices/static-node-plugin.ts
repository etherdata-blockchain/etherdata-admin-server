import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  IStaticNode,
  StaticNodeModel,
} from "../dbSchema/install-script/static-node";

/**
 * Docker image db plugin
 */
export class StaticNodePlugin extends DatabasePlugin<IStaticNode> {
  pluginName: PluginName = "staticNode";
  protected model: Model<IStaticNode> = StaticNodeModel;

  /**
   * Generate a static-nodes.json from static nodes
   * @param nodes
   */
  staticNodesToJSON(nodes: IStaticNode[]): string {
    const result = nodes.map((n) => n.nodeURL);
    return JSON.stringify(result);
  }
}
