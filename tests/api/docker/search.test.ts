global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { createMocks } from "node-mocks-http";
import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  DockerImageModel,
  IDockerImage,
} from "../../../internal/services/dbSchema/docker/docker-image";
import { MockDockerImage, MockDockerImage2 } from "../../data/mock_docker_data";
import handler from "../../../pages/api/v1/docker/search";
import { StatusCodes } from "http-status-codes";

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

  beforeEach(async () => {
    await DockerImageModel.ensureIndexes();
  });

  afterEach(async () => {
    try {
      await DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When searching with text", async () => {
    await DockerImageModel.create(MockDockerImage);
    await DockerImageModel.create(MockDockerImage2);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        key: MockDockerImage.imageName,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: IDockerImage[] = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
