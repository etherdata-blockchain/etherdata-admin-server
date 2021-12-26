import { MockJobResultData } from "../../data/mock_job_result_data";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/result/submit-result";
import mongoose from "mongoose";
import { StorageManagementItemPlugin } from "../../../internal/services/dbServices/storage-management-item-plugin";
import { MockConstant } from "../../data/mock_constant";
import { StatusCodes } from "http-status-codes";

jest.mock(
  "../../../internal/services/dbServices/storage-management-item-plugin"
);

describe("Given a result plugin", () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {});

  afterAll(() => {
    dbServer.stop();
  });

  test("When submit a result with existing user", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: MockJobResultData,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
  });

  test("When submit a result without existing user", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockInvalidTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: MockJobResultData,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });
});
