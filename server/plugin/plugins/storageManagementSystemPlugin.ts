import { Db, MongoClient } from "mongodb";

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
}
