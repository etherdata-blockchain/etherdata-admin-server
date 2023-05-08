import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { schema } from "@etherdata-blockchain/storage-model";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import jwt from "jsonwebtoken";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/v1/device/index";
import { StatusCodes } from "http-status-codes";

const { StorageItemModel } = schema;

describe("Given a create item handler", () => {
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
    await schema.StorageItemModel.collection.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("When calling get items function", async () => {
    await StorageItemModel.create(mockData.MockStorageItem);
    await StorageItemModel.create(mockData.MockStorageItem2);

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

  test("When calling create item function", async () => {
    const token = jwt.sign(
      { user: mockData.MockStorageUserId2 },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockStorageItem,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await StorageItemModel.countDocuments()).toBe(1);
  });
});
