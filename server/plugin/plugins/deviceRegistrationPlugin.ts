import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, deviceSchema, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import mongoose, { Model, Query } from "mongoose";
import axios, { AxiosError } from "axios";
import moment from "moment";
import jwt from "jsonwebtoken";

export class DeviceRegistrationPlugin extends DatabasePlugin<IDevice> {
  pluginName: PluginName = "deviceRegistration";
  protected model: Model<IDevice> = DeviceModel;

  protected performGet(id: string): Query<IDevice, IDevice> {
    //@ts-ignore
    return this.model.findOne({ id: id });
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
   * Return true if the device is registered in storage server.
   * If provided key, then will use that key for authorization
   * @param device
   * @param prev_key Previous assigned key
   * @return [is_authorized, auth_key]
   */
  async auth(
    device: string,
    prev_key: string | undefined
  ): Promise<[boolean, string | undefined]> {
    try {
      if (!prev_key) {
        const path = "storage_management/searchByQR?qr=" + device;
        const url = new URL(path, process.env.STORAGE_MANAGEMENT_URL);
        await axios.get(url.toString(), {
          headers: {
            Authorization: `Bearer ${process.env.STORAGE_MANAGEMENT_API_TOKEN}`,
          },
        });
        // Generate a key for next task
        const newKey = jwt.sign({ device }, process.env.PUBLIC_SECRET!, {
          expiresIn: 600,
        });
        return [true, newKey];
      } else {
        jwt.verify(prev_key, process.env.PUBLIC_SECRET!);
        /// verified key
        const newKey = jwt.sign({ device }, process.env.PUBLIC_SECRET!, {
          expiresIn: 600,
        });
        return [true, newKey];
      }
    } catch (err) {
      return [false, undefined];
    }
  }

  /**
   * Register device with users
   * @param device
   * @param user
   *
   * @return [success, error]
   */
  async register(
    device: string,
    user: string
  ): Promise<[boolean, string | undefined]> {
    try {
      const path = "storage_management/device/register";
      const url = new URL(path, process.env.STORAGE_MANAGEMENT_URL);
      await axios.post(
        url.toString(),
        { user, device },
        {
          headers: {
            Authorization: `Bearer ${process.env.STORAGE_MANAGEMENT_API_TOKEN}`,
          },
        }
      );
      return [true, undefined];
    } catch (e) {
      return [false, (e as AxiosError).response?.data.err];
    }
  }

  async getOnlineDevicesCount(): Promise<number> {
    let time = moment().subtract(10, "minutes");
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

  /**
   * Get devices by user
   * @param user
   * @return [success, reason, devices]
   */
  async getDevicesByUser(
    user: string
  ): Promise<[boolean, string | undefined, any[]]> {
    try {
      const path = "storage_management/device?user=" + user;
      const url = new URL(path, process.env.STORAGE_MANAGEMENT_URL);
      let resp = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${process.env.STORAGE_MANAGEMENT_API_TOKEN}`,
        },
      });
      return [true, undefined, resp.data];
    } catch (e) {
      return [false, (e as AxiosError).response?.data.err, []];
    }
  }
}
