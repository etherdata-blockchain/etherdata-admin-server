import { DeviceRegistrationPlugin } from "../plugin/plugins/deviceRegistrationPlugin";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { DeviceModel } from "../schema/device";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Device Register tests", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;

  // beforeAll(async () => {
  //   dbServer = await MongoMemoryServer.create();
  //   await mongoose.connect(dbServer.getUri().concat("etd"));
  // });
  //
  // afterEach(async () => {
  //   await DeviceModel.collection.drop();
  // });

  test("Auth", () => {
    //TODO: Add auth test
  });
});
