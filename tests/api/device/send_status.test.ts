global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
import mongoose from "mongoose";
<<<<<<< HEAD
<<<<<<< HEAD
import { DeviceModel } from "../../../services/dbSchema/device";
=======
import { DeviceModel } from "../../../internal/services/dbSchema/device";
>>>>>>> upstream/install-script
=======
import { DeviceModel } from "../../../internal/services/dbSchema/device";
>>>>>>> upstream/dev
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/status/send-status";
import { mockDeviceData } from "../../data/mockDeviceData";
import axios from "axios";
<<<<<<< HEAD
<<<<<<< HEAD
import { StorageManagementSystemPlugin } from "../../../services/dbServices/storageManagementSystemPlugin";

jest.mock("axios");
jest.mock("../../../services/dbServices/storageManagementSystemPlugin");
=======
import { StorageManagementSystemPlugin } from "../../../internal/services/dbServices/storage-management-system-plugin";

jest.mock("axios");
jest.mock(
  "../../../internal/services/dbServices/storage-management-system-plugin"
);
>>>>>>> upstream/install-script

=======
import { StorageManagementSystemPlugin } from "../../../internal/services/dbServices/storage-management-system-plugin";

jest.mock("axios");
jest.mock(
  "../../../internal/services/dbServices/storage-management-system-plugin"
);

>>>>>>> upstream/dev
describe("Test sending a user status", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

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

  test("Add new user and update", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    const token = jwt.sign({ user: "test-user" }, "test");
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

  test("Add new user without correct token", async () => {
    //@ts-ignore
    StorageManagementSystemPlugin.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    const token = jwt.sign({ user: "test-user" }, "test1");
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
