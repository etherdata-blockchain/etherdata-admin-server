/**
 * App plugin for app use
 */

import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { RegisteredPlugins } from "./registeredPlugins";
import { JobResultModel } from "../../../schema/job-result";
import { DeviceModel } from "../../../schema/device";
import { DeviceRegistrationPlugin } from "../deviceRegistrationPlugin";
import { ClientPlugin } from "./clientPlugin";

/**
 * Watch for database changes
 */
export class DBChangePlugin extends BaseSocketIOPlugin {
  pluginName: RegisteredPlugins = "dbChangePlugin";

  constructor() {
    super();
    this.watchJobChanges();
    this.periodicJobs = [
      {
        interval: 10,
        job: this.periodicSendLatestDevices.bind(this),
        name: "periodic_device_data",
      },
    ];
  }

  watchJobChanges() {
    JobResultModel.watch().on("change", (data) => {
      console.log(data);
    });

    DeviceModel.watch().on("change", (data) => {
      console.log(data);
    });
  }

  async periodicSendLatestDevices() {
    console.log("Sending data to browser clients");
    let devicePlugin = new DeviceRegistrationPlugin();
    let totalDevices = await devicePlugin.count();
    let totalOnlineDevices = await devicePlugin.getOnlineDevicesCount();
    let clientPlugin = this.findPlugin<ClientPlugin>("client");
    for (let [id, client] of Object.entries(clientPlugin!.browserClients)) {
      // Update latest client number and number of online devices
      let latestResult = client.lastResult;
      if (latestResult) {
        // send data to client
        latestResult.totalNumberDevices = totalDevices;
        latestResult.totalOnlineDevices = totalOnlineDevices;
        clientPlugin?.sendDataToClient(client, id, latestResult);
      }
    }
  }
}
