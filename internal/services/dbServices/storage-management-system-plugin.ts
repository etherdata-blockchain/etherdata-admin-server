import { Db, MongoClient } from "mongodb";
import { Configurations } from "../../const/configurations";
import {
  DefaultStorageUser,
  getStorageManagementAxiosClient,
} from "../../const/defaultValues";
import qs from "query-string";
import { Environments } from "../../const/environments";
import {
  PaginationResult,
  StorageItem,
  StorageUser,
} from "../../const/common_interfaces";
import join from "url-join";
import { Routes } from "../../const/routes";

/**
 * Storage management system plugin
 */
export class StorageManagementSystemPlugin {
  db: Db;
  client: MongoClient;

  // eslint-disable-next-line require-jsdoc
  constructor(dbClient?: MongoClient) {
    //@ts-ignore
    this.client = dbClient ?? global.MONGO_CLIENT;
    this.db = this.client.db(Configurations.storageDBName);
  }

  async findDeviceById(deviceId: string) {
    const coll = this.db.collection(Configurations.storageItemCollectionName);
    return await coll.findOne({ qr_code: deviceId });
  }

  async countItems() {
    const coll = this.db.collection(Configurations.storageItemCollectionName);
    return coll.countDocuments();
  }

  /**
   * Get list of users
   * @param{number} page start from 1
   */
  async getUsers(page: number): Promise<PaginationResult<StorageUser>> {
    const query = {
      page: page,
    };
    const response = await getStorageManagementAxiosClient().get(
      qs.stringifyUrl({
        url: join(
          Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_URL,
          Routes.owner
        ),
        query,
      })
    );

    const users: PaginationResult<StorageUser> = response.data;

    if (page === 1) users.results.push(DefaultStorageUser);

    return users;
  }

  /**
   * Get devices by user ID
   * @param{number} page current page number start from 1
   * @param{string} userID user's pk
   */
  async getDevicesByUser(
    page: number | string,
    userID?: string
  ): Promise<PaginationResult<StorageItem>> {
    const query: { [key: string]: any } = {
      page: page,
    };

    if (userID === DefaultStorageUser.user_id || userID === undefined) {
      query["no_owner"] = "True";
    } else {
      query["owner"] = userID;
    }

    const result = await getStorageManagementAxiosClient().get(
      qs.stringifyUrl({
        url: join(
          Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_URL,
          Routes.item
        ),
        query,
      })
    );

    return result.data;
  }
}
