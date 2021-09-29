/**
 * App plugin for app use
 */

import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { RegisteredPlugins } from "./registeredPlugins";
import { JobResultModel } from "../../../schema/job-result";
import { DeviceModel } from "../../../schema/device";

/**
 * Watch for database changes
 */
export class DBChangePlugin extends BaseSocketIOPlugin {
  pluginName: RegisteredPlugins = "dbChangePlugin";

  constructor() {
    super();
    this.watchJobChanges();
  }

  watchJobChanges() {
    JobResultModel.watch().on("change", (data) => {
      console.log(data);
    });

    DeviceModel.watch().on("change", (data) => {
      console.log(data);
    });
  }
}
