//
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { DeviceModel } from "../../../internal/services/dbSchema/device/device";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/devices-with-status";
import axios from "axios";
import {
  MockStorageItem,
  MockStorageItem2,
  MockStorageItem3,
} from "../../data/mock_storage_item";
import { StorageItemModel } from "../../../internal/services/dbSchema/device/storage/item";
import { MockConstant } from "../../data/mock_constant";
import {
  PaginationResult,
  StorageItem,
} from "../../../internal/const/common_interfaces";

jest.mock("axios");

describe("Given a device with status handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    //@ts-ignore
    axios.get.mockResolvedValue({});
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
      await StorageItemModel.collection.drop();
    } catch (e) {}
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("Test get devices by user", async () => {
    await StorageItemModel.create(MockStorageItem);
    await StorageItemModel.create(MockStorageItem2);
    await StorageItemModel.create(MockStorageItem3);

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        user: MockStorageItem.owner_id,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const data: PaginationResult<StorageItem> = res._getJSONData();
    expect(data.count).toBe(2);
  });
});
