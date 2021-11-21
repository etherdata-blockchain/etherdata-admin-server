import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import { Model, Query } from "mongoose";
import axios, { AxiosError } from "axios";
import moment from "moment";
import jwt from "jsonwebtoken";
import { ClientFilter } from "../../client/browserClient";
import Logger from "../../logger";
import { StorageManagementSystemPlugin } from "./storageManagementSystemPlugin";

export interface VersionInfo {
  version: string;
  count: number;
}

export class DeviceRegistrationPlugin extends DatabasePlugin<IDevice> {
  pluginName: PluginName = "deviceRegistration";
  protected model: Model<IDevice> = DeviceModel;

  async listWithFilter(
    pageNumber: number,
    pageSize: number,
    deviceIds: string[],
    filter?: ClientFilter
  ): Promise<IDevice[] | undefined> {
    let results = this.model.find({});
    if (filter) {
      let queryFilter: { [key: string]: any } = {
        id: { $in: deviceIds },
      };
      queryFilter[filter.key] = filter.value;

      results = this.model.find(queryFilter);
    }

    //@ts-ignore
    let pageResults = this.doPagination(results, pageNumber, pageSize);

    return await pageResults.exec();
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
   * Authenticate user with storage server.
   * Return true if the user is registered in storage server.
   * If provided key, then will use that key for authorization
   * @param device
   * @param prev_key Previous assigned key
   * @return [is_authorized, auth_key]
   */
  async auth(
    device: string,
    prev_key: string | undefined
  ): Promise<[boolean, string | undefined]> {
    /// If no previous key
    if (!prev_key) {
      try {
        return await this.authFromDB(device);
      } catch (e) {
        /// Cannot cannot to the db
        return [false, undefined];
      }
    } else {
      try {
        jwt.verify(prev_key, process.env.PUBLIC_SECRET!);
        /// verified key
        const newKey = jwt.sign({ device }, process.env.PUBLIC_SECRET!, {
          expiresIn: 600,
        });
        return [true, newKey];
      } catch (e) {
        /// Token is expired
        Logger.warning(`${device} key is expired. Re authenticate from DB`);
        try {
          return await this.authFromDB(device);
        } catch (e) {
          /// Cannot cannot to the db
          Logger.error(`${device} cannot auth due to ${e}`);
          return [false, undefined];
        }
      }
    }
  }

  /**
   * Register user with users
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
      const path = "storage_management/user/register";
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
      console.log(e);
      return [false, (e as AxiosError).response?.data.err];
    }
  }

  async getOnlineDevicesCount(
    deviceIds: string[],
    filter?: ClientFilter
  ): Promise<number> {
    let time = moment().subtract(10, "minutes");
    let query = this.model.find({ lastSeen: { $gt: time.toDate() } });
    if (filter) {
      let queryFilter: { [key: string]: any } = {
        lastSeen: { $gt: time.toDate() },
        id: { $in: deviceIds },
      };
      queryFilter[filter.key] = filter.value;
      query = this.model.find(queryFilter);
    }
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
      const path = "storage_management/user?user=" + encodeURIComponent(user);
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

  async getListOfAdminVersions(): Promise<VersionInfo[]> {
    const pipeline = this.model.aggregate([
      {
        $group: {
          _id: "$adminVersion",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          version: "$_id",
          count: "$count",
        },
      },
      {
        $sort: {
          version: 1,
        },
      },
    ]);

    return await pipeline.exec();
  }

  async getListOfNodeVersion(): Promise<VersionInfo[]> {
    const pipeline = this.model.aggregate([
      {
        $group: {
          _id: "$data.systemInfo.nodeVersion",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          version: "$_id",
          count: "$count",
        },
      },
      {
        $sort: {
          version: 1,
        },
      },
    ]);

    return await pipeline.exec();
  }

  async countWithFilter(deviceIds: string[], filter?: ClientFilter) {
    let results = this.model.find({});
    if (filter) {
      let queryFilter: { [key: string]: any } = { id: { $in: deviceIds } };
      queryFilter[filter.key] = filter.value;
      results = this.model.find(queryFilter);
    }

    return results.count();
  }

  /**
   * Get devices by miner address
   * @param miner
   * @param pageNumber
   * @param pageSize
   */
  async getDevicesByMiner(
    miner: string,
    pageNumber: number,
    pageSize: number
  ): Promise<[IDevice[], number, number]> {
    let devices = this.model.find({ "data.miner": miner });
    //@ts-ignore
    let results = this.doPagination(devices, pageNumber, pageSize);
    const devicesResults = await results.exec();
    const totalCount = await this.model.find({ "data.miner": miner }).count();
    const totalPageNumber = Math.ceil(totalCount / pageSize);

    return [devicesResults, totalCount, totalPageNumber];
  }

  protected performGet(id: string): Query<IDevice, IDevice> {
    //@ts-ignore
    return this.model.findOne({ id: id });
  }

  /**
   * Authentication from db
   * @param device
   * @private
   */
  private async authFromDB(
    device: string
  ): Promise<[boolean, string | undefined]> {
    const storageManagementPlugin = new StorageManagementSystemPlugin();
    const foundDevice = await storageManagementPlugin.findDeviceById(device);

    if (foundDevice) {
      // Generate a key for next task
      const newKey = jwt.sign({ device }, process.env.PUBLIC_SECRET!, {
        expiresIn: 600,
      });
      return [true, newKey];
    } else {
      return [false, undefined];
    }
  }
}
