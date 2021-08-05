import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import { Model } from "mongoose";

export class DeviceRegistrationPlugin extends DatabasePlugin<IDevice> {
  protected pluginName: PluginName = "deviceRegistration";
  protected model: Model<IDevice> = DeviceModel;

  async readFromDB(args: any): Promise<IDevice | undefined> {
    return undefined;
  }
}
