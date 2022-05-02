import { StatusCodes } from "http-status-codes";

import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/status/send-status";
import axios from "axios";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

jest.mock("axios");

describe("Test sending a user status", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    //@ts-ignore
    axios.get.mockResolvedValue({});
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  beforeEach(async () => {
    await schema.StorageItemModel.create({
      qr_code: mockData.MockConstant.mockTestingUser,
    });
  });

  afterEach(async () => {
    await schema.DeviceModel.deleteMany({});
    await schema.StorageItemModel.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
    await mongoose.disconnect();
  });

  test("Add new user and update", async () => {
    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        ...mockData.MockDeviceData,
        networkSettings: {
          localIpAddress: "192.168.0.1",
        },
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const data = await schema.DeviceModel.findOne({}).exec();
    expect(data.lastSeen).toBeDefined();
    expect(data.networkSettings.localIpAddress).toBeDefined();
    expect(data.networkSettings.remoteIpAddress).toBeDefined();
  });

  test("Add new user without correct token", async () => {
    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      "test1"
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });
});
