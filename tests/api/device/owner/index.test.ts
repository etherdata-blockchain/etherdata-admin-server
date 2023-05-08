import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { schema } from "@etherdata-blockchain/storage-model";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import jwt from "jsonwebtoken";
import { createMocks } from "node-mocks-http";
import handler from "../../../../pages/api/v1/device/owner";
import { StatusCodes } from "http-status-codes";
import { StorageOwnerModel } from "@etherdata-blockchain/storage-model/dist/db-schema";

describe("Given a edit owner handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: "test",
    };
    dbServer = await MongoMemoryServer.create({ binary: { version: "6.0.5" } });
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await schema.StorageOwnerModel.collection.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("When calling get owners function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user",
      user_id: mockData.MockStorageUserId,
    });
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_2",
      user_id: mockData.MockStorageUserId2,
    });

    const token = jwt.sign(
      { user: mockData.MockStorageUserId2 },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const data: interfaces.PaginationResult<any> = res._getJSONData();
    expect(data.results).toHaveLength(2);
  });

  test("When calling create owner function", async () => {
    const token = jwt.sign(
      { user: mockData.MockStorageUserId2 },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        user_name: "mock_user_2",
        user_id: mockData.MockStorageUserId2,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await StorageOwnerModel.countDocuments()).toBe(1);
  });
});
