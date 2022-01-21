import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/job/get-job";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { dbServices } from "@etherdata-blockchain/services";

jest.mock("@etherdata-blockchain/services");

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
    await schema.PendingJobModel.collection.drop();
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("Get a pending job", async () => {
    //@ts-ignore
    dbServices.StorageManagementService.mockImplementation(() => {
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
    expect(res._getStatusCode()).toBe(200);
  });
});
