import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/job/get-job";
import { mockDeviceData } from "./mockDeviceData";
import axios from "axios";

jest.mock("axios");

describe("Test get a pending job", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;
  let oldEnv = process.env;

  beforeAll(async () => {
    //@ts-ignore
    axios.get.mockResolvedValue({});
    process.env["STORAGE_MANAGEMENT_URL"] = "https://storage-management-system";
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: "test",
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
    } catch (e) {
      // console.log("Collection not exists");
    }
  });

  test("Get a pending job", async () => {
    let data: any = {
      from: "abcde",
      targetDeviceId: "test-device",
      task: {
        type: "rpc",
        value: "",
      },
      time: new Date(),
    };

    let token = jwt.sign({ user: "test-device" }, "test");
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
