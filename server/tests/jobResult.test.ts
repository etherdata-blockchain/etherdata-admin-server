import { DeviceRegistrationPlugin } from "../plugin/plugins/deviceRegistrationPlugin";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PendingJobModel } from "../schema/pending-job";
import { PendingJobPlugin } from "../plugin/plugins/pendingJobPlugin";
import { JobResultModel } from "../schema/job-result";
import { JobResultPlugin } from "../plugin/plugins/jobResultPlugin";

describe("Job Result Test", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await JobResultModel.collection.drop();
  });

  test("Get a result", async () => {
    await new JobResultModel({
      deviceID: "1",
      time: new Date(2020, 4, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
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
      time: new Date(2020, 4, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
    }).save();

    await new JobResultModel({
      deviceID: "1",
      time: new Date(2020, 5, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
    }).save();

    let plugin = new JobResultPlugin();
    let result = await plugin.getResults("a");
    expect(result?.length).toBe(2);
    expect(await JobResultModel.count()).toBe(0);
  });
});
