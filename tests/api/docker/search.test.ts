import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import handler from "../../../pages/api/v1/docker/search";
import { StatusCodes } from "http-status-codes";

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
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(
      dbServer.getUri().concat(mockData.MockConstant.mockDatabaseName)
    );
  });

  beforeEach(async () => {
    await schema.DockerImageModel.ensureIndexes();
  });

  afterEach(async () => {
    try {
      await schema.DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When searching with text", async () => {
    await schema.DockerImageModel.create(mockData.MockDockerImage);
    await schema.DockerImageModel.create(mockData.MockDockerImage2);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        key: mockData.MockDockerImage.imageName,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: interfaces.db.DockerImageDBInterface[] = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
