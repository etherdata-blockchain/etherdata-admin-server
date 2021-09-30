import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, deviceSchema, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import mongoose, { Model, Query } from "mongoose";
import axios from "axios";
import moment from "moment";

export class DeviceRegistrationPlugin extends DatabasePlugin<IDevice> {
  pluginName: PluginName = "deviceRegistration";
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
  async auth(device: string): Promise<boolean> {
    try {
      const path = "storage_management/searchByQR?qr=" + device;
      const url = new URL(path, process.env.STORAGE_MANAGEMENT_URL);
      await axios.get(url.toString());
      return true;
    } catch (err) {
      return false;
    }
  }

  async addDevice(device: any): Promise<boolean> {
    let result = await this.patch(device);
    return true;
  }

  async getOnlineDevicesCount(): Promise<number> {
    let time = moment().subtract(10, "minutes");
    console.log(time.toDate());
    let query = this.model.find({ lastSeen: { $gt: time.toDate() } });
    return query.count();
  }

  async findDeviceByDeviceID(deviceID: string): Promise<IDevice | null> {
    let query = this.model.findOne({ id: deviceID });
    let result = await query.exec();
    if (result?.data?.systemInfo.isSyncing) {
      //@ts-ignore
      result.data.systemInfo.isSyncing = true;
    }
    return JSON.parse(JSON.stringify(result));
  }
}
