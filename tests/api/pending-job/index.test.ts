global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MockPendingJob, MockPendingJob2 } from "../../data/mock_pending_job";

import {
  AnyValueType,
  IPendingJob,
  PendingJobModel,
} from "../../../internal/services/dbSchema/queue/pending-job";
import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import handler from "../../../pages/api/v1/device/job/index";
import { MockDockerImage } from "../../data/mock_template_data";
import { IDockerImage } from "../../../internal/services/dbSchema/docker/docker-image";
import { PaginationResult } from "../../../internal/const/common_interfaces";

describe("Given a docker image handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: MockConstant.mockTestingUser },
    MockConstant.mockTestingSecret
  );

  beforeAll(async () => {
    //@ts-ignore
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(
      dbServer.getUri().concat(MockConstant.mockDatabaseName)
    );
  });

  afterEach(async () => {
    try {
      await PendingJobModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a get request to the server", async () => {
    await PendingJobModel.insertMany([MockPendingJob, MockPendingJob2]);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: PaginationResult<IPendingJob<AnyValueType>> =
      res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.results.length).toBe(2);
    expect(result.count).toBe(2);
    expect(result.totalPage).toBe(1);
  });
});
