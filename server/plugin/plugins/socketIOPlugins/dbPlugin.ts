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
import {
  JobTaskType,
  PendingJobModel,
} from "../../../../internal/services/dbSchema/queue/pending-job";
import { SocketIOEvents } from "../../../../internal/const/events";
import { Configurations } from "../../../../internal/const/configurations";
import { DeviceRegistrationPlugin } from "../../../../internal/services/dbServices/device-registration-plugin";

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
      {
        interval: 10,
        job: this.periodicSendOnlineCount.bind(this),
        name: "periodic_send_online_count",
      },
    ];
  }

  /**
   * Periodic send latest online devices number
   */
  async periodicSendOnlineCount() {
    const clientPlugin = this.findPlugin<ClientPlugin>("client");
    const plugin = new DeviceRegistrationPlugin();
    const onlineCount = await plugin.getOnlineDevicesCount();
    const totalCount = await plugin.count();
    clientPlugin?.server?.emit(SocketIOEvents.latestInfo, {
      totalCount,
      onlineCount,
    });
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
                case JobTaskType.Docker:
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(
                      `${SocketIOEvents.dockerResult}-${result.jobId}`,
                      result.result
                    );
                  break;

                case JobTaskType.Web3:
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(
                      `${SocketIOEvents.rpcResult}-${result.jobId}`,
                      result.result
                    );
                  break;
              }
            } else {
              switch (result.commandType) {
                case JobTaskType.Docker:
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(
                      `${SocketIOEvents.dockerError}-${result.jobId}`,
                      result.result
                    );
                  break;
                case JobTaskType.Web3:
                  clientPlugin?.server
                    ?.in(result.from)
                    .emit(
                      `${SocketIOEvents.dockerError}-${result.jobId}`,
                      result.result
                    );
                  break;
              }
            }
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
              .emit(SocketIOEvents.detailInfo, data.fullDocument);
            break;
          default:
            break;
        }
      }
    );

    PendingJobModel.watch([], { fullDocument: "updateLookup" }).on(
      "change",
      async (data) => {
        const clientPlugin = this.findPlugin<ClientPlugin>("client");
        if (
          data.operationType === "insert" ||
          data.operationType === "delete"
        ) {
          const totalNumber = await PendingJobModel.countDocuments();
          clientPlugin?.server?.emit(SocketIOEvents.pendingJob, totalNumber);
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
    const maximumDuration = Configurations.maximumNotSeenDuration;
    await jobPlugin.removeOutdatedJobs(maximumDuration);
    await jobResultPlugin.removeOutdatedJobs(maximumDuration);
  }
}
