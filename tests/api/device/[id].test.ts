import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { schema } from "@etherdata-blockchain/storage-model";
import { mockData } from "@etherdata-blockchain/common";
import jwt from "jsonwebtoken";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/v1/device/[id]";
import { StatusCodes } from "http-status-codes";
import { StorageItemModel } from "@etherdata-blockchain/storage-model/dist/db-schema";

describe("Given a edit item handler", () => {
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

  test("When calling patch item function", async () => {
    const item = await schema.StorageItemModel.create(mockData.MockStorageItem);

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
        id: item.id,
      },
      body: {
        owner_id: "mock_user_2",
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);

    const data = await StorageItemModel.findOne({
      _id: item._id,
    }).exec();
    expect(data!.owner_id).toBe("mock_user_2");
  });

  test("When calling get item function", async () => {
    const item = await schema.StorageItemModel.create(mockData.MockStorageItem);

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
        id: item.id,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);

    const data = res._getJSONData();
    expect(data!.owner_id).toBe(item.owner_id);
  });

  test("When calling delete owners function", async () => {
    const item = await schema.StorageItemModel.create(mockData.MockStorageItem);

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
        id: item._id,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.ACCEPTED);

    expect(await StorageItemModel.countDocuments()).toBe(0);
  });
});
