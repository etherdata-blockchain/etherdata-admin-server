import { DeviceRegistrationPlugin } from "../plugin/plugins/deviceRegistrationPlugin";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { DeviceModel } from "../schema/device";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Device Register tests", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await DeviceModel.collection.drop();
  });

  test("Register device", async () => {
    let device = await new DeviceModel({
      name: "a",
      id: "2",
      online: true,
    }).save();

    let plugin = new DeviceRegistrationPlugin();
    let [success, reason] = await plugin.register("1", "2");
    expect(success).toBeTruthy();
    expect(reason).toBeUndefined();
  });

  test("Register device when not found", async () => {
    let device = await new DeviceModel({
      name: "a",
      id: "2",
      online: true,
    }).save();

    let plugin = new DeviceRegistrationPlugin();
    let [success, reason] = await plugin.register("1", "1");
    expect(success).toBeFalsy();
  });
});
