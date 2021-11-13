import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PendingJobModel } from "../schema/pending-job";
import { PendingJobPlugin } from "../plugin/plugins/pendingJobPlugin";

describe("Pending job tests", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await PendingJobModel.collection.drop();
  });

  test("Get a job", async () => {
    await new PendingJobModel({
      targetDeviceId: "1",
      time: new Date(2020, 5, 1),
      from: "a",
      task: {
        type: "rpc",
        value: [],
      },
    }).save();

    let plugin = new PendingJobPlugin();
    let job = await plugin.getJob("1");
    expect(job).toBeDefined();
    expect(await PendingJobModel.count()).toBe(0);
  });

  test("Get no job", async () => {
    await PendingJobModel.createCollection();
    let plugin = new PendingJobPlugin();
    let job = await plugin.getJob("1");
    expect(job).not.toBeDefined();
    expect(await PendingJobModel.count()).toBe(0);
  });

  test("Get a job 2", async () => {
    await new PendingJobModel({
      targetDeviceId: "1",
      time: new Date(2020, 4, 1),
      from: "a",
      task: {
        type: "rpc",
        value: [],
      },
    }).save();

    await new PendingJobModel({
      targetDeviceId: "1",
      time: new Date(2020, 5, 1),
      from: "a",
      task: {
        type: "rpc",
        value: [],
      },
    }).save();

    let plugin = new PendingJobPlugin();
    let job = await plugin.getJob("1");
    expect(job).toBeDefined();
    expect(job?.time.getMonth()).toBe(4);
    expect(await PendingJobModel.count()).toBe(1);
  });
});
