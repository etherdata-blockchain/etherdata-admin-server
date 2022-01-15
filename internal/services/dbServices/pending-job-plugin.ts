import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  AnyValueType,
  IPendingJob,
  PendingJobModel,
  PendingJobTaskType,
} from "../dbSchema/queue/pending-job";
import moment from "moment";

/**
 * Plugin for pending job
 */
export class PendingJobPlugin extends DatabasePlugin<
  IPendingJob<AnyValueType>
> {
  pluginName: PluginName = "pendingJob";
  protected model: Model<IPendingJob<AnyValueType>> = PendingJobModel;

  /**
   * Get a job and update the retrieved field to true.
   * Will only return the job with retrieved false
   * @param deviceID
   */
  async getJob<T extends PendingJobTaskType>(
    deviceID: string
  ): Promise<IPendingJob<T> | undefined> {
    const result = await this.model.findOneAndUpdate(
      {
        targetDeviceId: deviceID,
        retrieved: false,
      },
      {
        retrieved: true,
      },
      { sort: { time: 1 } }
    );

    if (result === null) {
      return undefined;
    }

    //@ts-ignore
    return result;
  }

  /**
   * Insert many jobs
   * @param jobs
   */
  async insertMany(jobs: IPendingJob<AnyValueType>[]) {
    await this.model.insertMany(jobs);
  }

  /**
   * Remove outdated jobs
   * @param maximumDuration In seconds
   */
  async removeOutdatedJobs(maximumDuration: number) {
    const deadline = moment().subtract(maximumDuration, "seconds");
    await this.model.deleteMany({ updatedAt: { $lte: deadline.toDate() } });
  }
}
