global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MockConstant } from "../../data/mock_constant";
import {
  DockerImageModel,
  IDockerImage,
} from "../../../internal/services/dbSchema/docker/docker-image";
import handler from "../../../pages/api/v1/docker/index";
import webhookHandler from "../../../pages/api/v1/docker/webhook";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { StatusCodes } from "http-status-codes";
import { createMocks } from "node-mocks-http";
import { MockDockerImage, MockWebHookData } from "../../data/mock_docker_data";
import jwt from "jsonwebtoken";
import { PaginationResult } from "../../../server/plugin/basePlugin";

describe("Given a docker handler", () => {
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
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
      await DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When making a post request", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: MockDockerImage,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await DockerImageModel.countDocuments()).toBe(1);

    const data: IDockerImage = await DockerImageModel.findOne({}).exec();
    expect(data.tags[0].tag).toBe(MockDockerImage.tags[0].tag);
    expect(data.tags[0]._id).toBeDefined();
  });

  test("When trying to make a post request to webhook without any image data before", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: {
        token: token,
      },
      body: MockWebHookData,
    });

    //@ts-ignore
    await webhookHandler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await DockerImageModel.countDocuments()).toBe(1);

    const data: IDockerImage = await DockerImageModel.findOne({}).exec();
    expect(data.tags[0].tag).toBe(MockDockerImage.tags[0].tag);
    expect(data.tags[0]._id).toBeDefined();
  });

  test("When trying make a post request to webhook with existing image data", async () => {
    const data = {
      imageName: MockWebHookData.repository.repo_name,
      tags: [{ tag: "v1.0" }],
    };
    await DockerImageModel.create(data);
    const { req, res } = createMocks({
      method: "POST",
      query: {
        token: token,
      },
      body: MockWebHookData,
    });

    //@ts-ignore
    await webhookHandler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    const dockerData = await DockerImageModel.findOne({
      imageName: "test/testhook",
    }).exec();
    expect(await DockerImageModel.countDocuments()).toBe(1);
    expect(dockerData.tags.length).toBe(2);
  });

  test("When making a get request", async () => {
    const data1 = {
      imageName: "test_data_1",
      tags: [{ tag: "v1.0" }],
    };

    const data2 = {
      imageName: "test_data_2",
      tags: [{ tag: "v1.0" }],
    };

    const data3 = {
      imageName: "test_data_3",
      tags: [{ tag: "v1.0" }],
    };
    await DockerImageModel.create(data1);
    await DockerImageModel.create(data2);
    await DockerImageModel.create(data3);
    const { req, res } = createMocks({
      method: "GET",
      query: {
        pageSize: "2",
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    const resultData: PaginationResult<any> = res._getJSONData() as any;
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(resultData.count).toBe(3);
    expect(resultData.results.length).toBe(2);
    expect(resultData.results[0].imageName).toBe("test_data_1");
    expect(resultData.results[1].imageName).toBe("test_data_2");
  });

  test("When making a get request without any data before", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        pageSize: "2",
        page: "0",
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    const resultData: PaginationResult<any> = res._getJSONData() as any;
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(resultData.count).toBe(0);
    expect(resultData.results.length).toBe(0);
  });

  test("When making a get request exceeds maximum page number", async () => {
    const data1 = {
      imageName: "test_data_1",
      tags: [{ tag: "v1.0" }],
    };

    await DockerImageModel.create(data1);
    const { req, res } = createMocks({
      method: "GET",
      query: {
        pageSize: "1",
        page: "2",
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    const resultData: PaginationResult<any> = res._getJSONData() as any;
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(resultData.count).toBe(1);
    expect(resultData.results.length).toBe(0);
  });
});
