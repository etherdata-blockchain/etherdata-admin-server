import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, deviceSchema, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import mongoose, { Model, Query } from "mongoose";
import { IPendingJob, PendingJobModel } from "../../schema/pending-job";

export class PendingJobPlugin extends DatabasePlugin<IPendingJob> {
  pluginName: PluginName = "pendingJob";
  protected model: Model<IPendingJob> = PendingJobModel;

  /**
   * Get a job
   * @param deviceID
   */
  async getJob(deviceID: string): Promise<IPendingJob | undefined> {
    const result = await this.model.findOneAndRemove(
      {
        targetDeviceId: deviceID,
      },
      { sort: { time: 1 } }
    );

    if (result === null) {
      return undefined;
    }
    return result;
  }
}
