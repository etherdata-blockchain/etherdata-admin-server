import { Db, MongoClient } from "mongodb";
import { Configurations } from "../../const/configurations";
import { DefaultStorageUser } from "../../const/defaultValues";

export interface StorageUser {
  _id: string;
  id?: string;
  // eslint-disable-next-line camelcase
  user_name: string;
  // eslint-disable-next-line camelcase
  user_id: string;
  coinbase?: string;
  balance?: string;
}

export interface PaginatedStorageUsers {
  users: StorageUser[];
  totalUsers: number;
  totalPage: number;
}

export interface PaginatedItems {
  storageDevices: any[];
  totalPage: number;
  totalDevices: number;
}

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

  async getUsers(page: number): Promise<PaginatedStorageUsers> {
    const ownCol = this.db.collection<StorageUser>(
      Configurations.storageUserCollectionName
    );
    const users = await ownCol
      .find()
      .skip(page * Configurations.numberPerPage)
      .limit(Configurations.numberPerPage)
      .toArray();

    const totalUsers = (await ownCol.countDocuments()) + 1;
    const totalPage = Math.ceil(totalUsers / Configurations.numberPerPage);
    if (page === 0) users.push(DefaultStorageUser);

    return {
      totalUsers: totalUsers,
      users: users,
      totalPage,
    };
  }

  async getDevicesByUser(
    page: number,
    userID?: string
  ): Promise<PaginatedItems> {
    const deviceCol = this.db.collection(
      Configurations.storageItemCollectionName
    );
    const deviceIdsQuery = deviceCol.find({
      owner_id: userID,
    });

    const devices = await deviceIdsQuery
      .skip(page * Configurations.numberPerPage)
      .limit(Configurations.numberPerPage)
      .project({ qr_code: 1, name: 1 })
      .toArray();

    const totalDevices = await deviceCol.count({
      owner_id: userID,
    });
    const totalPage = Math.ceil(totalDevices / Configurations.numberPerPage);

    return {
      storageDevices: devices,
      totalDevices,
      totalPage,
    };
  }
}
