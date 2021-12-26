global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import moment from "moment";
import { MockConstant } from "../../data/mock_constant";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { DeviceModel } from "../../../internal/services/dbSchema/device/device";
import { DeviceRegistrationPlugin } from "../../../internal/services/dbServices/device-registration-plugin";
import { Configurations } from "../../../internal/const/configurations";
import {
  MockDeviceID,
  MockDeviceStatus,
  MockDeviceStatus2,
} from "../../data/mock_storage_item";
import {
  MockAdminVersion1,
  MockAdminVersion2,
  MockAdminVersion3,
} from "../../data/mock_device_data";
import { StorageManagementItemPlugin } from "../../../internal/services/dbServices/storage-management-item-plugin";
import jwt from "jsonwebtoken";

jest.mock(
  "../../../internal/services/dbServices/storage-management-item-plugin"
);

describe("Given a device plugin", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
    process.env = {
      ...process.env,
      PUBLIC_SECRET: MockConstant.mockTestingSecret,
    };
  });

  afterEach(async () => {
    try {
      await DeviceModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling get item by id", async () => {
    const device = await new DeviceModel({
      name: "a",
      id: "a",
      adminVersion: "1.0.0",
      lastSeen: moment(),
    }).save();
    expect(device._id).toBeDefined();

    const plugin = new DeviceRegistrationPlugin();
    const pluginResult = await plugin.get("a");
    expect(pluginResult?.name).toBe("a");
    expect(pluginResult?.id).toBeDefined();
    expect(pluginResult.isOnline).toBeTruthy();
  });

  test("When calling list all items", async () => {
    await new DeviceModel({
      name: "a",
      id: "a",
      adminVersion: "1.0.0",
      lastSeen: moment()
        .subtract(Configurations.maximumNotSeenDuration * 2, "seconds")
        .toDate(),
    }).save();

    await new DeviceModel({
      name: "b",
      id: "b",
      adminVersion: "1.0.0",
      lastSeen: new Date(),
    }).save();

    await new DeviceModel({
      name: "c",
      id: "c",
      adminVersion: "1.0.0",
    }).save();

    const plugin = new DeviceRegistrationPlugin();
    const pluginResult = await plugin.list(
      Configurations.defaultPaginationStartingPage,
      200
    );
    expect(pluginResult?.results.length).toBe(3);
    expect(pluginResult?.count).toBe(3);
    expect(pluginResult?.results[0].isOnline).toBeFalsy();
    expect(pluginResult?.results[1].isOnline).toBeTruthy();
    expect(pluginResult?.results[2].isOnline).toBeFalsy();
  });

  test("When calling online devices count", async () => {
    await DeviceModel.create(MockDeviceStatus);
    await DeviceModel.create(MockDeviceStatus2);

    const plugin = new DeviceRegistrationPlugin();
    const count = await plugin.getOnlineDevicesCount();
    expect(count).toBe(1);
  });

  test("When calling list of admin versions", async () => {
    await new DeviceModel(MockAdminVersion1).save();

    await new DeviceModel(MockAdminVersion2).save();

    await new DeviceModel(MockAdminVersion3).save();

    const plugin = new DeviceRegistrationPlugin();
    const result = await plugin.getListOfAdminVersions();
    expect(result.length).toBe(3);
  });

  test("When calling list of admin versions v2", async () => {
    await new DeviceModel(MockAdminVersion1).save();

    await new DeviceModel(MockAdminVersion2).save();

    await new DeviceModel(MockAdminVersion2).save();

    const plugin = new DeviceRegistrationPlugin();
    const result = await plugin.getListOfAdminVersions();
    expect(result.length).toBe(2);
  });

  test("When calling auth with previous provided correct key", async () => {
    const plugin = new DeviceRegistrationPlugin();
    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockTestingSecret
    );
    const result = await plugin.auth(MockDeviceID, token);
    expect(result[0]).toBeTruthy();
  });

  test("When calling auth with previous provided incorrect key", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const plugin = new DeviceRegistrationPlugin();
    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockInvalidTestingSecret
    );
    const result = await plugin.auth(MockDeviceID, token);
    expect(result[0]).toBeTruthy();
  });
});
