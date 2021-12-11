global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { JobResultModel } from "../../internal/services/dbSchema/queue/job-result";
import { JobResultPlugin } from "../../internal/services/dbServices/job-result-plugin";
import { StorageManagementSystemPlugin } from "../../internal/services/dbServices/storage-management-system-plugin";

jest.mock(
  "../../internal/services/dbServices/storage-management-system-plugin"
);

describe("Job Result Test", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await JobResultModel.collection.drop();
  });

  test("Get a result", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });
    await new JobResultModel({
      jobId: 1,
      deviceID: "1",
      time: new Date(2020, 4, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
      success: true,
      commandType: "",
    }).save();

    let plugin = new JobResultPlugin();
    let result = await plugin.getResults("a");
    expect(result).toBeDefined();
    expect(result?.length).toBe(1);
    expect(await JobResultModel.count()).toBe(0);
  });

  test("Get no result", async () => {
    await JobResultModel.createCollection();
    let plugin = new JobResultPlugin();
    let result = await plugin.getResults("a");
    expect(result?.length).toBe(0);
    expect(await JobResultModel.count()).toBe(0);
  });

  test("Get a result 2", async () => {
    await new JobResultModel({
      deviceID: "1",
      jobId: 1,
      time: new Date(2020, 4, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
      success: true,
      commandType: "",
    }).save();

    await new JobResultModel({
      jobId: 1,
      deviceID: "1",
      time: new Date(2020, 5, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
      success: true,
    }).save();

    let plugin = new JobResultPlugin();
    let result = await plugin.getResults("a");
    expect(result?.length).toBe(2);
    expect(await JobResultModel.count()).toBe(0);
  });
});
