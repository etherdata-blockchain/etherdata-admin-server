import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { schema } from "@etherdata-blockchain/storage-model";
import { mockData } from "@etherdata-blockchain/common";
import jwt from "jsonwebtoken";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/v1/device/get/id/by_user";
import { StatusCodes } from "http-status-codes";

describe("Given a get device ids handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: "test",
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await schema.StorageItemModel.collection.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("When calling get function", async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);
    await schema.StorageItemModel.create(mockData.MockStorageItem3);

    const token = jwt.sign(
      { user: mockData.MockStorageUserId },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        user: mockData.MockStorageUserId,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const result = res._getJSONData();
    expect(result.ids).toHaveLength(2);
  });
});
