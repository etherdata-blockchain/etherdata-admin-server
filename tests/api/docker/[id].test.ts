global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { InstallationTemplateModel } from "../../../internal/services/dbSchema/install-script/install-script";
import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { MockStaticNode } from "../../data/mock_static_node";
import handler from "../../../pages/api/v1/docker/[id]";
import { MockDockerImage } from "../../data/mock_template_data";
import {
  DockerImageModel,
  IDockerImage,
} from "../../../internal/services/dbSchema/docker/docker-image";

describe("Given a docker image handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: MockConstant.mockTestingUser },
    MockConstant.mockTestingSecret
  );
  let dockerImageId: string | undefined = undefined;

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
    const dockerImage = await DockerImageModel.create(MockDockerImage);
    dockerImageId = `${dockerImage._id}`;
  });

  afterEach(async () => {
    try {
      await InstallationTemplateModel.collection.drop();
      await DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a get request to the server", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: dockerImageId,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: IDockerImage = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.tags.length).toBe(MockDockerImage.tags.length);
    expect(result.imageName).toBe(MockDockerImage.imageName);
  });

  test("When sending a patch request to the server", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: dockerImageId,
      },
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: IDockerImage = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.tags.length).toBe(MockDockerImage.tags.length);
    expect(result.imageName).toBe(MockDockerImage.imageName);
  });

  test("When sending a delete request to the server", async () => {
    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: dockerImageId,
      },
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.message).toBe("OK");
  });

  test("When sending a post request to the server", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: dockerImageId,
      },
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
