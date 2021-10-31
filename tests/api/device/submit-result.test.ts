import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/result/submit-result";
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

  test("Submit a result", async () => {
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

    let token = jwt.sign({ user: "test-device" }, "test");
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
