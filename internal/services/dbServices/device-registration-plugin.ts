import {
  DatabasePlugin,
  PaginationResult,
} from "../../../server/plugin/basePlugin";
import { DeviceModel, IDevice } from "../dbSchema/device";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model, Query } from "mongoose";
import axios, { AxiosError } from "axios";
import moment from "moment";
import jwt from "jsonwebtoken";
import { ClientFilter } from "../../../server/client/browserClient";
import Logger from "../../../server/logger";
import { StorageManagementSystemPlugin } from "./storage-management-system-plugin";
import { Environments } from "../../const/environments";

export interface VersionInfo {
  version: string;
  count: number;
}

/**
 * Device registration plugin will register,
 * update, and query the info of devices
 */
export class DeviceRegistrationPlugin extends DatabasePlugin<any> {
  pluginName: PluginName = "deviceRegistration";
  protected model: Model<IDevice> = DeviceModel;

  /**
   * List devices with custom filter
   * @param pageNumber
   * @param pageSize
   * @param deviceIds
   * @param filter
   */
  async listWithFilter(
    pageNumber: number,
    pageSize: number,
    deviceIds: string[],
    filter?: ClientFilter
  ): Promise<PaginationResult<IDevice> | undefined> {
    let results = this.model.find({
      id: { $in: deviceIds },
    });
    if (filter) {
      const queryFilter: { [key: string]: any } = {
        id: { $in: deviceIds },
      };
      queryFilter[filter.key] = filter.value;
      results = this.model.find(queryFilter);
    }

    //@ts-ignore
    const pageResults = this.doPagination(results, pageNumber, pageSize);

    return await pageResults;
  }

  // eslint-disable-next-line require-jsdoc
  async performPatch(data: IDevice): Promise<IDevice> {
    const result = await this.model.findOneAndUpdate(
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
   * @param prevKey Previous assigned key
   * @return [is_authorized, auth_key]
   */
  async auth(
    device: string,
    prevKey: string | undefined
  ): Promise<[boolean, string | undefined]> {
    /// If no previous key
    if (!prevKey) {
      try {
        return await this.authFromDB(device);
      } catch (e) {
        /// Cannot connect to the db
        return [false, undefined];
      }
    } else {
      try {
        jwt.verify(prevKey, Environments.ServerSideEnvironments.PUBLIC_SECRET);
        /// verified key
        const newKey = jwt.sign(
          { device },
          Environments.ServerSideEnvironments.PUBLIC_SECRET,
          {
            expiresIn: 600,
          }
        );
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
      const url = new URL(
        path,
        Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_URL
      );
      await axios.post(
        url.toString(),
        { user, device },
        {
          headers: {
            Authorization: `Bearer ${Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_API_TOKEN}`,
          },
        }
      );
      return [true, undefined];
    } catch (e) {
      console.log(e);
      return [false, (e as AxiosError).response?.data.err];
    }
  }

  /**
   * Get number of online devices
   * @param deviceIds
   * @param filter
   */
  async getOnlineDevicesCount(
    deviceIds: string[],
    filter?: ClientFilter
  ): Promise<number> {
    const time = moment().subtract(10, "minutes");
    const query = this.model.find({
      lastSeen: { $gt: time.toDate() },
    });
    // if (filter) {
    //   let queryFilter: { [key: string]: any } = {
    //     lastSeen: { $gt: time.toDate() },
    //   };
    //   queryFilter[filter.key] = filter.value;
    //   query = this.model.find(queryFilter);
    // }
    return query.count();
  }

  /**
   * Get device by device id
   * @param deviceID
   */
  async findDeviceByDeviceID(deviceID: string): Promise<IDevice | null> {
    const query = this.model.findOne({ id: deviceID });
    const result = await query.exec();
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
      const url = new URL(
        path,
        Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_URL
      );
      const resp = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_API_TOKEN}`,
        },
      });
      return [true, undefined, resp.data];
    } catch (e) {
      return [false, (e as AxiosError).response?.data.err, []];
    }
  }

  /**
   * Return the admin version distribution
   */
  async getListOfAdminVersions(): Promise<VersionInfo[]> {
    const pipeline = this.model.aggregate([
      {
        //@ts-ignore
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

    return pipeline.exec();
  }

  /**
   * Return a list of node's etd version
   */
  async getListOfNodeVersion(): Promise<VersionInfo[]> {
    const pipeline = this.model.aggregate([
      {
        // @ts-ignore
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

  /**
   * Return the count result with custom filter
   * @param deviceIds
   * @param filter
   */
  async countWithFilter(deviceIds: string[], filter?: ClientFilter) {
    const queryFilter: { [key: string]: any } = {};
    const results = this.model.find(queryFilter);
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
  ): Promise<PaginationResult<IDevice>> {
    const devices = this.model.find({ "data.miner": miner });
    return this.doPagination(devices as any, pageNumber, pageSize);
  }

  // eslint-disable-next-line require-jsdoc
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
