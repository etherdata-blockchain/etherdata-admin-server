import { DatabasePlugin } from "../basePlugin";
import { DeviceModel, deviceSchema, IDevice } from "../../schema/device";
import { PluginName } from "../pluginName";
import mongoose, { Model, Query } from "mongoose";
import axios, { AxiosError } from "axios";
import moment from "moment";
import jwt from "jsonwebtoken";
import { ClientFilter } from "../../client/browserClient";
import { MongoClient } from "mongodb";
import Logger from "../../logger";

export interface VersionInfo {
  version: string;
  count: number;
}

export class DeviceRegistrationPlugin extends DatabasePlugin<IDevice> {
  pluginName: PluginName = "deviceRegistration";
  protected model: Model<IDevice> = DeviceModel;

  protected performGet(id: string): Query<IDevice, IDevice> {
    //@ts-ignore
    return this.model.findOne({ id: id });
  }

  async listWithFilter(
    pageNumber: number,
    pageSize: number,
    filter?: ClientFilter
  ): Promise<IDevice[] | undefined> {
    let results = this.model.find({});
    if (filter) {
      let queryFilter: { [key: string]: any } = {};
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
   * Authentication from db
   * @param device
   * @private
   */
  private async authFromDB(
    device: string
  ): Promise<[boolean, string | undefined]> {
    //@ts-ignore
    const client: MongoClient = global.MONGO_CLIENT;
    const db = client.db("storage-management-system");
    const coll = db.collection("storage_management_item");
    const found = await coll.findOne({ qr_code: device });
    if (found) {
      // Generate a key for next task
      const newKey = jwt.sign({ device }, process.env.PUBLIC_SECRET!, {
        expiresIn: 600,
      });
      return [true, newKey];
    } else {
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

  async getOnlineDevicesCount(filter?: ClientFilter): Promise<number> {
    let time = moment().subtract(10, "minutes");
    let query = this.model.find({ lastSeen: { $gt: time.toDate() } });
    if (filter) {
      let queryFilter: { [key: string]: any } = {
        lastSeen: { $gt: time.toDate() },
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
      const path = "storage_management/device?user=" + encodeURIComponent(user);
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

  async countWithFilter(filter?: ClientFilter) {
    let results = this.model.find({});
    if (filter) {
      let queryFilter: { [key: string]: any } = {};
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
}
