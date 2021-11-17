import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Test find devices by user", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;
  let oldEnv = process.env;

  // beforeAll(async () => {
  //   process.env = {
  //     ...oldEnv,
  //     PUBLIC_SECRET: "test",
  //   };
  //   dbServer = await MongoMemoryServer.create();
  //   await mongoose.connect(dbServer.getUri().concat("etd"));
  // });
  //
  // afterEach(async () => {
  //   await DeviceModel.collection.drop();
  // });

  test("Test get devices", () => {
    //TODO: Get all devices from user
  });
});
