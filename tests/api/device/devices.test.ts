import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { DeviceModel } from "../../../server/schema/device";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/devices";

describe("Test find devices by user", () => {
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
    await DeviceModel.collection.drop();
  });

  test("Get devices", async () => {
    let device = await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
      user: "abcde",
    }).save();

    let token = jwt.sign({ user: "abcde" }, "test");
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().length).toBe(1);
  });

  test("Get devices 2", async () => {
    await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
      user: "abcde",
    }).save();

    await new DeviceModel({
      name: "b",
      id: "b",
      online: true,
      user: "abcde",
    }).save();

    let token = jwt.sign({ user: "ab" }, "test");
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().length).toBe(0);
  });

  test("Get devices 2", async () => {
    await new DeviceModel({
      name: "a",
      id: "a",
      online: true,
      user: "abcde",
    }).save();

    await new DeviceModel({
      name: "b",
      id: "b",
      online: true,
      user: "abcd",
    }).save();

    let token = jwt.sign({ user: "abcde" }, "test");
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().length).toBe(1);
  });
});
