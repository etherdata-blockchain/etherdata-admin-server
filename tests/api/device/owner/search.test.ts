import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../../pages/api/v1/device/owner/search";
import axios from "axios";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

jest.mock("axios");

describe("Given a device owner search handler", () => {
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
    await schema.StorageOwnerModel.collection.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("When calling search function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_1",
      user_id: "mock_user_id_1",
    });
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_2",
      user_id: "mock_user_id_2",
    });

    await schema.StorageOwnerModel.create({
      user_name: "mock_user_3",
      user_id: "mock_user_id_3",
    });

    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        key: "mock_user",
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const data: any = res._getJSONData();
    expect(data).toHaveLength(3);
  });

  test("When calling search function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_1",
      user_id: "mock_user_id_1",
    });
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_2",
      user_id: "mock_user_id_2",
    });

    await schema.StorageOwnerModel.create({
      user_name: "mock_user_3",
      user_id: "mock_user_id_3",
    });

    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        key: "",
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const data: any = res._getJSONData();
    expect(data).toHaveLength(0);
  });

  test("When calling search function", async () => {
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_1",
      user_id: "mock_user_id_1",
    });
    await schema.StorageOwnerModel.create({
      user_name: "mock_user_2",
      user_id: "mock_user_id_2",
    });

    await schema.StorageOwnerModel.create({
      user_name: "mock_user_3",
      user_id: "mock_user_id_3",
    });

    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        key: "mock_user_1",
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const data: any = res._getJSONData();
    expect(data).toHaveLength(1);
    expect(data[0].user_id).toBe("mock_user_id_1");
  });
});
