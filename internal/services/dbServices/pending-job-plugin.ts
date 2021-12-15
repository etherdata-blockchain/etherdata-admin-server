import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import { IPendingJob, PendingJobModel } from "../dbSchema/queue/pending-job";
import moment from "moment";

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

  /**
   * Remove outdated jobs
   * @param maximumDuration In seconds
   */
  async removeOutdatedJobs(maximumDuration: number) {
    const deadline = moment().subtract(maximumDuration, "seconds");
    await this.model.deleteMany({ time: { $lte: deadline.toDate() } });
  }
}
