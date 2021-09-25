import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, deviceSchema, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import mongoose, { Model, Query } from "mongoose";

export class DeviceRegistrationPlugin extends DatabasePlugin<IDevice> {
  protected pluginName: PluginName = "deviceRegistration";
  protected model: Model<IDevice> = DeviceModel;

  protected performGet(id: string): Query<IDevice, IDevice> {
    //@ts-ignore
    return this.model.findOne({ id: id });
  }

  /**
   * Do registration for device with user.
   * Will return both success status and reason
   *
   * @param userId
   * @param deviceId
   *
   * @return success and reason.
   */
  async register(
    userId: string,
    deviceId: any
  ): Promise<[boolean, string | undefined]> {
    let device = await this.get(deviceId);
    if (device) {
      if (device.user) {
        return [false, "Device has been registered by another user"];
      }
      device.user = userId;
      await device.save();
      return [true, undefined];
    }

    return [false, "Device Not found"];
  }

  async findDevicesByUser(user: string): Promise<IDevice[]> {
    let res = await this.model.find({ user: user });
    return res;
  }

  async performPatch(data: IDevice): Promise<IDevice> {
    let result = await this.model.findOneAndUpdate(
      { id: data.id },
      //@ts-ignore
      data,
      { upsert: true }
    );
    //@ts-ignore
    return result;
  }

  /**
   * Authenticate device with storage server.
   * Return true if the device is registered in storage server
   * @param device
   */
  async auth(device: any): Promise<boolean> {
    return true;
  }

  async addDevice(device: any): Promise<boolean> {
    let result = await this.patch(device);
    return true;
  }
}
