import { Db, MongoClient } from "mongodb";
import { Configurations } from "../../const/configurations";
import { Config } from "dockerode";
import { DefaultStorageUser } from "../../const/defaultValues";

export interface StorageUser {
  _id: string;
  id?: string;
  user_name: string;
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

export class StorageManagementSystemPlugin {
  db: Db;
  client: MongoClient;

  constructor() {
    //@ts-ignore
    this.client = global.MONGO_CLIENT;
    this.db = this.client.db("storage-management-system");
  }

  async findDeviceById(deviceId: string) {
    const coll = this.db.collection("storage_management_item");
    return await coll.findOne({ qr_code: deviceId });
  }

  async count() {
    const coll = this.db.collection("storage_management_item");
    return coll.countDocuments();
  }

  async getUsers(page: number): Promise<PaginatedStorageUsers> {
    const ownCol = this.db.collection<StorageUser>("storage_management_owner");
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

  async getDeviceIdsByUser(
    page: number,
    userID?: string
  ): Promise<PaginatedItems> {
    const deviceCol = this.db.collection("storage_management_item");
    const deviceIdsQuery = deviceCol.find({
      owner_id: userID ? parseInt(userID) : undefined,
    });

    const devices = await deviceIdsQuery
      .skip(page * Configurations.numberPerPage)
      .limit(Configurations.numberPerPage)
      .project({ qr_code: 1, name: 1 })
      .toArray();

    const totalDevices = await deviceCol.count({
      owner_id: userID ? parseInt(userID) : undefined,
    });
    const totalPage = Math.ceil(totalDevices / Configurations.numberPerPage);

    return {
      storageDevices: devices,
      totalDevices,
      totalPage,
    };
  }
}
