/**
 * App plugin for app use
 */

import { BaseSocketIOPlugin } from "../../basePlugin";
import { RegisteredPlugins } from "./registeredPlugins";
import { JobResultModel } from "../../../../services/dbSchema/job-result";
import { DeviceModel } from "../../../../services/dbSchema/device";
import { DeviceRegistrationPlugin } from "../../../../services/dbServices/deviceRegistrationPlugin";
import { ClientPlugin } from "./clientPlugin";
import { PendingJobPlugin } from "../../../../services/dbServices/pendingJobPlugin";
import { JobResultPlugin } from "../../../../services/dbServices/jobResultPlugin";

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
      {
        interval: 120,
        job: this.periodicRemoveJobsAndResponses.bind(this),
        name: "periodic_device_data",
      },
    ];
  }

  watchJobChanges() {
    JobResultModel.watch([], { fullDocument: "updateLookup" }).on(
      "change",
      async (data) => {
        const clientPlugin = this.findPlugin<ClientPlugin>("client");
        switch (data.operationType) {
          case "insert":
            let result = data.fullDocument!;
            if (result.success) {
              switch (result.commandType) {
                case "docker":
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(`docker-result-${result.jobId}`, result.result);
                  break;

                case "web3":
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(`rpc-result-${result.jobId}`, result.result);
                  break;
              }
            } else {
              switch (result.commandType) {
                case "docker":
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(`docker-error-${result.jobId}`, result.result);
                  break;
                case "web3":
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(`docker-error-${result.jobId}`, result.result);
                  break;
              }
            }
            console.log(result);
            // await JobResultModel.deleteOne({ _id: result._id });

            break;
        }
      }
    );

    DeviceModel.watch([], { fullDocument: "updateLookup" }).on(
      "change",
      (data) => {
        const clientPlugin = this.findPlugin<ClientPlugin>("client");
        switch (data.operationType) {
          case "insert":
            console.log("Inserting");
            break;

          case "update":
            clientPlugin?.server
              ?.in(data.fullDocument?.id)
              .emit("detail-info", data.fullDocument);
            break;
          default:
            break;
        }
      }
    );
  }

  async periodicSendLatestDevices() {
    let devicePlugin = new DeviceRegistrationPlugin();
    let clientPlugin = this.findPlugin<ClientPlugin>("client");

    for (let [id, client] of Object.entries(clientPlugin!.browserClients)) {
      // Update latest client number and number of online devices
      let latestResult = await client.generatePaginationResult();
      clientPlugin?.sendDataToClient(client, id, latestResult);
    }
  }

  async periodicRemoveJobsAndResponses() {
    const jobPlugin = new PendingJobPlugin();
    const jobResultPlugin = new JobResultPlugin();
    const maximumDuration = 60;
    await jobPlugin.removeOutdatedJobs(maximumDuration);
    await jobResultPlugin.removeOutdatedJobs(maximumDuration);
  }
}
