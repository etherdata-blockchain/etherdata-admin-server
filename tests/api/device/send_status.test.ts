import mongoose from "mongoose";
import { DeviceModel } from "../../../server/schema/device";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/status/send-status";
import { mockDeviceData } from "./mockDeviceData";
import axios from "axios";
import { StorageManagementSystemPlugin } from "../../../server/plugin/plugins/storageManagementSystemPlugin";

jest.mock("axios");
jest.mock("../../../server/plugin/plugins/storageManagementSystemPlugin");

describe("Test send device status", () => {
  let dbServer: MongoMemoryServer;
  let oldEnv = process.env;

  beforeAll(async () => {
    //@ts-ignore
    axios.get.mockResolvedValue({});
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: "test",
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
      await DeviceModel.collection.drop();
    } catch (e) {
      // console.log("Collection not exists");
    }
  });

  test("Add new device and update", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    let token = jwt.sign({ user: "test-device" }, "test");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
  });

  test("Add new device without correct token", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    let token = jwt.sign({ user: "test-device" }, "test1");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
  });
});
