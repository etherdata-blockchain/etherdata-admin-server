global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/job/get-job";
import { MockDeviceData } from "../../data/mock_device_data";
import { PendingJobModel } from "../../../internal/services/dbSchema/queue/pending-job";
import { StorageManagementItemPlugin } from "../../../internal/services/dbServices/storage-management-item-plugin";

jest.mock("../../../internal/services/dbSchema/queue/pending-job");
jest.mock(
  "../../../internal/services/dbServices/storage-management-item-plugin"
);

describe("Test getting a pending job", () => {
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

  afterEach(async () => {
    try {
      await PendingJobModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("Get a pending job", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const data: any = {
      from: "abcde",
      targetDeviceId: "test-user",
      task: {
        type: "rpc",
        value: "",
      },
      time: new Date(),
    };
    await PendingJobModel.create(data);

    const token = jwt.sign({ user: "test-user" }, "test");
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
