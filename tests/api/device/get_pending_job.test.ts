global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/job/get-job";
import { mockDeviceData } from "./mockDeviceData";
import { PendingJobModel } from "../../../services/dbSchema/pending-job";
import { StorageManagementSystemPlugin } from "../../../services/dbServices/storageManagementSystemPlugin";

jest.mock("../../../services/dbServices/storageManagementSystemPlugin");

describe("Test get a pending job", () => {
  let dbServer: MongoMemoryServer;
  let oldEnv = process.env;

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
    } catch (e) {
      // console.log("Collection not exists");
    }
  });

  test("Get a pending job", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    let data: any = {
      from: "abcde",
      targetDeviceId: "test-user",
      task: {
        type: "rpc",
        value: "",
      },
      time: new Date(),
    };
    await PendingJobModel.create(data);

    let token = jwt.sign({ user: "test-user" }, "test");
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
