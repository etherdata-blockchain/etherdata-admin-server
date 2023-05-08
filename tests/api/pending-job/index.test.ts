import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import handler from "../../../pages/api/v1/device/job/index";
import { enums, interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

describe("Given a docker image handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockTestingSecret
  );

  beforeAll(async () => {
    //@ts-ignore
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create({ binary: { version: "6.0.5" } });
    await mongoose.connect(
      dbServer.getUri().concat(mockData.MockConstant.mockDatabaseName)
    );
  });

  afterEach(async () => {
    try {
      await schema.PendingJobModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a get request to the server", async () => {
    await schema.PendingJobModel.insertMany([
      mockData.MockPendingJob,
      mockData.MockPendingJob2,
    ]);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: interfaces.PaginationResult<
      interfaces.db.PendingJobDBInterface<enums.AnyValueType>
    > = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.results.length).toBe(2);
    expect(result.count).toBe(2);
    expect(result.totalPage).toBe(1);
  });
});
