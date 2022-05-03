import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { schema } from "@etherdata-blockchain/storage-model";
import { mockData } from "@etherdata-blockchain/common";
import jwt from "jsonwebtoken";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/v1/device/edit/device-owner";
import { StatusCodes } from "http-status-codes";
import { dbServices } from "@etherdata-blockchain/services";
import { StorageOwnerModel } from "@etherdata-blockchain/storage-model/dist/db-schema";

describe("Given a edit owner handler", () => {
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

  test("When calling edit owner function", async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);
    await schema.StorageItemModel.create(mockData.MockStorageItem3);

    const storageServices = new dbServices.StorageManagementService();

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
        devices: [
          mockData.MockStorageItem.qr_code,
          mockData.MockStorageItem2.qr_code,
          mockData.MockStorageItem3.qr_code,
        ],
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    const devices = await storageServices.getDeviceIdsByUser(
      mockData.MockStorageUserId2
    );
    expect(devices).toHaveLength(3);
  });

  test("When calling edit owner function", async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);
    await schema.StorageItemModel.create(mockData.MockStorageItem3);

    const storageServices = new dbServices.StorageManagementService();

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
        devices: [
          mockData.MockStorageItem.qr_code,
          mockData.MockStorageItem2.qr_code,
          mockData.MockStorageItem3.qr_code,
        ],
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    const devices = await storageServices.getDeviceIdsByUser(
      mockData.MockStorageUserId2
    );
    expect(devices).toHaveLength(3);
    expect(await StorageOwnerModel.countDocuments({})).toBe(0);
  });

  test("When missing some required parameters", async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);
    await schema.StorageItemModel.create(mockData.MockStorageItem3);

    const storageServices = new dbServices.StorageManagementService();

    const token = jwt.sign(
      { user: mockData.MockStorageUserId2 },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {},
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.BAD_REQUEST);
  });

  test("When calling edit owner function", async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);
    await schema.StorageItemModel.create(mockData.MockStorageItem3);

    const storageServices = new dbServices.StorageManagementService();

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
        devices: [mockData.MockStorageItem3.qr_code],
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    const devices = await storageServices.getDeviceIdsByUser(
      mockData.MockStorageUserId2
    );
    expect(devices).toHaveLength(1);
  });
});
