import moment from "moment";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { DeviceModel } from "../../../internal/services/dbSchema/device/device";
import { DeviceRegistrationPlugin } from "../../../internal/services/dbServices/device-registration-plugin";
import { Configurations } from "../../../internal/const/configurations";

describe("Given a db plugin", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await DeviceModel.collection.drop();
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling get item by id", async () => {
    const device = await new DeviceModel({
      name: "a",
      id: "a",
      adminVersion: "1.0.0",
    }).save();
    expect(device._id).toBeDefined();

    const plugin = new DeviceRegistrationPlugin();
    const pluginResult = await plugin.get("a");
    expect(pluginResult?.name).toBe("a");
    expect(pluginResult?.id).toBeDefined();
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
});
