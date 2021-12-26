global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import {
  MockDeviceStatus,
  MockDeviceStatus2,
  MockStorageItem,
  MockStorageItem2,
  MockStorageUserId,
} from "../../data/mock_storage_item";

import { StorageItemModel } from "../../../internal/services/dbSchema/device/storage/item";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { DeviceModel } from "../../../internal/services/dbSchema/device/device";
import { StorageManagementItemPlugin } from "../../../internal/services/dbServices/storage-management-item-plugin";
import { expect } from "@jest/globals";

describe("Given a storage item", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await StorageItemModel.collection.drop();
    await DeviceModel.collection.drop();
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling get devices by user", async () => {
    await StorageItemModel.create(MockStorageItem);
    await StorageItemModel.create(MockStorageItem2);
    await DeviceModel.create(MockDeviceStatus);
    await DeviceModel.create(MockDeviceStatus2);

    const plugin = new StorageManagementItemPlugin();
    const results = await plugin.getDevicesByUser(1, MockStorageUserId);
    expect(results.count).toBe(2);
    expect(results.results.length).toBe(2);
    expect(results.currentPage).toBe(1);

    expect(results.results[0].status.adminVersion).toBe(
      MockDeviceStatus.adminVersion
    );
  });
});
