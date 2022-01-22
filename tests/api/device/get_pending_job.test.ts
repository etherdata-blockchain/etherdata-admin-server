import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/job/get-job";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { dbServices } from "@etherdata-blockchain/services";
import { StatusCodes } from "http-status-codes";
import { DeviceRegistrationService } from "@etherdata-blockchain/services/src/mongodb/services/device/device_registration_service";

describe("Given a pending job", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: "test",
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  beforeEach(async () => {
    await schema.StorageItemModel.create({
      qr_code: "test-user",
    });
  });

  afterEach(async () => {
    await schema.PendingJobModel.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
    await mongoose.disconnect();
  });

  test("When calling get a pending job", async () => {
    const data: any = {
      from: "abcde",
      targetDeviceId: "test-user",
      task: {
        type: "rpc",
        value: "",
      },
      time: new Date(),
    };
    await schema.PendingJobModel.create(data);

    const token = jwt.sign({ user: "test-user" }, "test");
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });
});
