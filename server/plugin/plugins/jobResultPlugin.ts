import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, deviceSchema, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import mongoose, { Model, Query } from "mongoose";
import { IPendingJob, PendingJobModel } from "../../schema/pending-job";
import { IJobResult, JobResultModel } from "../../schema/job-result";

export class JobResultPlugin extends DatabasePlugin<IJobResult> {
  pluginName: PluginName = "jobResult";
  protected model: Model<IJobResult> = JobResultModel;

  /**
   * Get results
   * @param from User ID
   */
  async getResults(from: string): Promise<IJobResult[] | undefined> {
    const result = await this.model.find({ from: from });
    await this.model.remove({ from: from });

    if (result === null) {
      return undefined;
    }
    return result;
  }
}
