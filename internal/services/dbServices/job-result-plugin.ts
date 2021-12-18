<<<<<<< HEAD
=======
<<<<<<< HEAD:services/dbServices/jobResultPlugin.ts
>>>>>>> upstream/dev
import {DatabasePlugin} from "../../../server/plugin/basePlugin";
import {PluginName} from "../../../server/plugin/pluginName";
import {Model} from "mongoose";
import {IJobResult, JobResultModel} from "../dbSchema/queue/job-result";
<<<<<<< HEAD
=======
=======
import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import { IJobResult, JobResultModel } from "../dbSchema/queue/job-result";
>>>>>>> upstream/dev:internal/services/dbServices/job-result-plugin.ts
>>>>>>> upstream/dev
import moment from "moment";

// eslint-disable-next-line require-jsdoc
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

  /**
   * Remove outdated jobs
   * @param maximumDuration In seconds
   */
  async removeOutdatedJobs(maximumDuration: number) {
    const deadline = moment().subtract(maximumDuration, "seconds");
    await this.model.deleteMany({ time: { $lte: deadline.toDate() } });
  }
}
