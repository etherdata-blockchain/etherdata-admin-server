import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { DeviceModel } from "../../../server/schema/device";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/send-status";
import { mockDeviceData } from "./mockDeviceData";

describe("Test send device status", () => {
  let dbServer: MongoMemoryServer;
  let connection: MongoClient;
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
      await DeviceModel.collection.drop();
    } catch (e) {
      console.log("Collection not exists");
    }
  });

  test("Add new device and update", async () => {
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
