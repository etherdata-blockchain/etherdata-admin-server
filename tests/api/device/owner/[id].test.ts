import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { schema } from "@etherdata-blockchain/storage-model";
import { mockData } from "@etherdata-blockchain/common";
import jwt from "jsonwebtoken";
import { createMocks } from "node-mocks-http";
import handler from "../../../../pages/api/v1/device/owner/[id]";
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

  test("When calling patch owners function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user",
      user_id: mockData.MockStorageUserId,
    });

    const token = jwt.sign(
      { user: mockData.MockStorageUserId2 },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: mockData.MockStorageUserId,
      },
      body: {
        user_name: "mock_user1",
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);

    const data = await StorageOwnerModel.findOne({
      user_id: mockData.MockStorageUserId,
    }).exec();
    expect(data!.user_name).toBe("mock_user1");
  });

  test("When calling get owners function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user",
      user_id: mockData.MockStorageUserId,
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
      query: {
        id: mockData.MockStorageUserId,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);

    const data = res._getJSONData();
    expect(data!.user_name).toBe("mock_user");
  });

  test("When calling delete owners function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user",
      user_id: mockData.MockStorageUserId,
    });

    const token = jwt.sign(
      { user: mockData.MockStorageUserId2 },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: mockData.MockStorageUserId,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.ACCEPTED);

    expect(await StorageOwnerModel.countDocuments()).toBe(0);
  });
});
