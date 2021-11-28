global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/result/submit-result";
import { StorageManagementSystemPlugin } from "../../../services/dbServices/storageManagementSystemPlugin";
import mongoose from "mongoose";

jest.mock("../../../server/plugin/plugins/storageManagementSystemPlugin");

describe("Test submit result", () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: "test",
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {});

  test("Submit a result if user exist", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    let data: any = {
      jobId: 123,
      deviceID: "1",
      time: new Date(2020, 5, 1),
      from: "a",
      command: {
        type: "rpc",
        value: ["blockNumber"],
      },
      result: "0",
      success: true,
    };

    let token = jwt.sign({ user: "test-user" }, "test");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: data,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
  });
});
