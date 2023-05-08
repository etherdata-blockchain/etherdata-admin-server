import { schema } from "@etherdata-blockchain/storage-model";
import { mockData } from "@etherdata-blockchain/common";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/auth/index";
import { StatusCodes } from "http-status-codes";

describe("Given a authorization handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create({ binary: { version: "6.0.5" } });
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  beforeEach(async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageOwnerModel.create(mockData.MockUser);
  });

  afterEach(async () => {
    await schema.StorageItemModel.deleteMany({});
    await schema.StorageOwnerModel.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
    await mongoose.disconnect();
  });

  test("Should return ok status", async () => {
    const token = jwt.sign(
      { user: mockData.MockStorageItem.qr_code },
      mockData.MockConstant.mockTestingSecret
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
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });

  test("Should return not authorized error", async () => {
    const token = jwt.sign(
      { user: mockData.MockStorageItem2.qr_code },
      mockData.MockConstant.mockTestingSecret
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

  test("Should return not authorized error", async () => {
    const token = jwt.sign(
      { user: mockData.MockStorageItem2.qr_code },
      mockData.MockConstant.mockTestingSecret + "mock"
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
