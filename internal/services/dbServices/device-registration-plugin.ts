import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { DeviceModel, IDevice } from "../dbSchema/device/device";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model, Query } from "mongoose";
import axios, { AxiosError } from "axios";
import moment from "moment";
import jwt from "jsonwebtoken";
import Logger from "../../../server/logger";
import { StorageManagementItemPlugin } from "./storage-management-item-plugin";
import { Environments } from "../../const/environments";
import { PaginationResult, StorageItem } from "../../const/common_interfaces";
import { Configurations } from "../../const/configurations";

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
   * Get total number of online devices
   */
  async getOnlineDevicesCount(): Promise<number> {
    const time = moment().subtract(
      Configurations.maximumNotSeenDuration,
      "seconds"
    );
    const query = this.model.find({
      lastSeen: { $gt: time.toDate() },
    });

    return query.count();
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
    const storageManagementPlugin = new StorageManagementItemPlugin();
    const authorized = await storageManagementPlugin.auth(device);

    if (authorized) {
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
