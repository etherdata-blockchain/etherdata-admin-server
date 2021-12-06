import { DatabasePlugin } from "../../server/plugin/basePlugin";
import { PluginName } from "../../server/plugin/pluginName";
import { Model } from "mongoose";
import { UpdateScript, UpdateScriptModel } from "../dbSchema/update_scipt";
import moment from "moment";

export class UpdateScriptPlugin extends DatabasePlugin<UpdateScript> {
    pluginName: PluginName = "updateScript";
    protected model: Model<UpdateScript> = UpdateScriptModel;

    /**
     * Get updateScript for deviceID
     * @param deviceID
     */
    async getJob(deviceID: string): Promise<UpdateScript | undefined> {
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
