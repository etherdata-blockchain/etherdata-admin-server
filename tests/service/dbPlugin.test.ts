global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
<<<<<<< HEAD:tests/service/dbPlugin.test.ts
import { DeviceModel } from "../../services/dbSchema/device";
import { DeviceRegistrationPlugin } from "../../services/dbServices/deviceRegistrationPlugin";
=======
import { DeviceModel } from "../../internal/services/dbSchema/device";
import { DeviceRegistrationPlugin } from "../../internal/services/dbServices/device-registration-plugin";
>>>>>>> upstream/install-script:server/tests/dbPlugin.test.ts

describe("DB Plugin Tests", () => {
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

  test("Get Data By ID", async () => {
    const device = await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
      adminVersion: "1.0.0",
    }).save();
    expect(device._id).toBeDefined();

    const plugin = new DeviceRegistrationPlugin();
    const pluginResult = await plugin.get("a");
    expect(pluginResult?.name).toBe("a");
    expect(pluginResult?.id).toBeDefined();
  });

  test("List All Items", async () => {
    await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
      adminVersion: "1.0.0",
    }).save();

    await new DeviceModel({
      name: "b",
      id: "b",
      online: true,
      adminVersion: "1.0.0",
    }).save();

    const plugin = new DeviceRegistrationPlugin();
    const pluginResult = await plugin.list(0, 200);
    expect(pluginResult?.results.length).toBe(2);
    expect(pluginResult?.count).toBe(2);
  });
});
