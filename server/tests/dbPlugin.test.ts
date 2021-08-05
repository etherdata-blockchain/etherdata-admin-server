import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { DeviceModel } from "../schema/device";
import { DatabasePlugin } from "../plugin/basePlugin";
import { DeviceRegistrationPlugin } from "../plugin/plugins/deviceRegistrationPlugin";

describe("DB Plugin Tests", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await DeviceModel.collection.drop();
  });

  test("Get Data By ID", async () => {
    let device = await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
    }).save();
    expect(device._id).toBeDefined();

    let plugin = new DeviceRegistrationPlugin();
    let pluginResult = await plugin.get(device._id);
    expect(pluginResult?.name).toBe("a");
    expect(pluginResult?.id).toBe("a");
    expect(pluginResult?.online).toBeTruthy();
  });

  test("List All Items", async () => {
    await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
    }).save();

    await new DeviceModel({
      name: "b",
      id: "b",
      online: true,
    }).save();

    let plugin = new DeviceRegistrationPlugin();
    let pluginResult = await plugin.list(0, 200);
    expect(pluginResult?.length).toBe(2);
  });
});
