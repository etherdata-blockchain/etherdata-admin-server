import { StatusCodes } from "http-status-codes";

import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/status/send-status";
import axios from "axios";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { dbServices } from "@etherdata-blockchain/services";

jest.mock("axios");
jest.mock("@etherdata-blockchain/storage-model");

describe("Test sending a user status", () => {
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
    await schema.DeviceModel.deleteMany({});
  });

  test("Add new user and update", async () => {
    //@ts-ignore
    dbServices.StorageManagementService.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const token = jwt.sign({ user: "test-user" }, "test");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
  });

  test("Add new user without correct token", async () => {
    //@ts-ignore
    dbServices.StorageManagementService.mockImplementation(() => {
      return {
        findDeviceById: jest.fn(() => Promise.resolve({ a: "a" })),
      };
    });

    const token = jwt.sign({ user: "test-user" }, "test1");
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
