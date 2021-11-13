import { MongoClient } from "mongodb";

export class StorageManagementSystemPlugin {
  async findDeviceById(deviceId: string) {
    //@ts-ignore
    const client: MongoClient = global.MONGO_CLIENT;
    const db = client.db("storage-management-system");
    const coll = db.collection("storage_management_item");
    return await coll.findOne({ qr_code: deviceId });
  }
}
