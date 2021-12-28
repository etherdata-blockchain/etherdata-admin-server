import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import { IUpdateScript, UpdateScriptModel } from "../dbSchema/update_script";

export class UpdateScriptPlugin extends DatabasePlugin<IUpdateScript> {
    pluginName: PluginName = "updateScript";
    protected model: Model<IUpdateScript> = UpdateScriptModel;

    /**
     * Get updateScript for deviceID
     * @param deviceID
     */
    async getUpdateScript(deviceID: string): Promise<IUpdateScript | undefined> {
        const result = await this.model.findOne(
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
     * Create updateScript in MongoDB
     * @param updateScriptInfo
     */
    async createUpdateScript(updateScriptInfo: IUpdateScript): Promise<boolean | undefined> {
        const result = await this.model.create(updateScriptInfo);

        if (result === null) {
            return undefined;
        } else {
            return true;
        }
    }
}
