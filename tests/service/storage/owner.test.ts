global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { StorageOwnerModel } from "../../../internal/services/dbSchema/device/storage/owner";

import { StorageItemModel } from "../../../internal/services/dbSchema/device/storage/item";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { DeviceModel } from "../../../internal/services/dbSchema/device/device";
import {
  MockDeviceStatus,
  MockDeviceStatus2,
  MockStorageItem,
  MockStorageItem2,
  MockUser,
  MockUser2,
} from "../../data/mock_storage_item";
import { StorageManagementOwnerPlugin } from "../../../internal/services/dbServices/storage-management-owner-plugin";

describe("Given a storage owner", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
      await StorageItemModel.collection.drop();
      await DeviceModel.collection.drop();
      await StorageOwnerModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling get list of users", async () => {
    await StorageOwnerModel.create(MockUser);
    await StorageOwnerModel.create(MockUser2);
    await StorageItemModel.create(MockStorageItem);
    await StorageItemModel.create(MockStorageItem2);
    await DeviceModel.create(MockDeviceStatus);
    await DeviceModel.create(MockDeviceStatus2);
    const plugin = new StorageManagementOwnerPlugin();
    const result = await plugin.getListOfUsers(1);
    expect(result.count).toBe(2);
    expect(result.totalPage).toBe(1);
    expect(result.results.length).toBe(2);

    const user1 = result.results.find((r) => r.user_id === MockUser.user_id);
    const user2 = result.results.find((r) => r.user_id === MockUser2.user_id);
    expect(user1!.totalCount).toBe(2);
    expect(user1!.onlineCount).toBe(1);

    expect(user2!.totalCount).toBe(0);
    expect(user2!.onlineCount).toBe(0);
  });

  test("When calling list of users without any user", async () => {
    const plugin = new StorageManagementOwnerPlugin();
    const result = await plugin.getListOfUsers(1);
    expect(result.results.length).toBe(0);
  });
});
