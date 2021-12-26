/**
 * App plugin for app use
 */

import { BaseSocketIOPlugin } from "../../basePlugin";
import { RegisteredPlugins } from "./registeredPlugins";
import { JobResultModel } from "../../../../internal/services/dbSchema/queue/job-result";
import { DeviceModel } from "../../../../internal/services/dbSchema/device/device";
import { ClientPlugin } from "./clientPlugin";
import { PendingJobPlugin } from "../../../../internal/services/dbServices/pending-job-plugin";
import { JobResultPlugin } from "../../../../internal/services/dbServices/job-result-plugin";

/**
 * Watch for database changes
 */
export class DBChangePlugin extends BaseSocketIOPlugin {
  pluginName: RegisteredPlugins = "dbChangePlugin";

  // eslint-disable-next-line require-jsdoc
  constructor() {
    super();
    this.watchJobChanges();
    this.periodicJobs = [
      {
        interval: 120,
        job: this.periodicRemoveJobsAndResponses.bind(this),
        name: "periodic_device_data",
      },
    ];
  }

  /**
   * Watch for collection's changes
   */
  watchJobChanges() {
    JobResultModel.watch([], { fullDocument: "updateLookup" }).on(
      "change",
      async (data) => {
        const clientPlugin = this.findPlugin<ClientPlugin>("client");
        switch (data.operationType) {
          case "insert":
            const result = data.fullDocument!;
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

  /**
   * Periodic remove jobs from db
   */
  async periodicRemoveJobsAndResponses() {
    const jobPlugin = new PendingJobPlugin();
    const jobResultPlugin = new JobResultPlugin();
    const maximumDuration = 60;
    await jobPlugin.removeOutdatedJobs(maximumDuration);
    await jobResultPlugin.removeOutdatedJobs(maximumDuration);
  }
}
