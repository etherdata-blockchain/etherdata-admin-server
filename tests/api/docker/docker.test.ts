import handler from "../../../pages/api/v1/docker/index";
import webhookHandler from "../../../pages/api/v1/docker/webhook";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { StatusCodes } from "http-status-codes";
import { createMocks } from "node-mocks-http";
import { configs, interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

import jwt from "jsonwebtoken";

describe("Given a docker handler", () => {
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
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    await schema.DockerImageModel.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
    await mongoose.disconnect();
  });

  test("When making a post request", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDockerImage,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await schema.DockerImageModel.countDocuments()).toBe(1);
    const data: schema.IDockerImage = (await schema.DockerImageModel.findOne(
      {}
    ).exec())!;
    expect(data.tags[0].tag).toBe(mockData.MockDockerImage.tags[0].tag);
    expect(data.tags[0]._id).toBeDefined();
  });

  test("When trying to make a post request to webhook without any image data before", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: {
        token: token,
      },
      body: mockData.MockWebHookData,
    });

    //@ts-ignore
    await webhookHandler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await schema.DockerImageModel.countDocuments()).toBe(1);

    const data: schema.IDockerImage = (await schema.DockerImageModel.findOne(
      {}
    ).exec())!;
    expect(data.tags[0].tag).toBe(mockData.MockDockerImage.tags[0].tag);
    expect(data.tags[0]._id).toBeDefined();
  });

  test("When trying to make a post request to webhook with existing image data", async () => {
    const data = {
      imageName: mockData.MockWebHookData.repository.repo_name,
      tags: [{ tag: "v1.0" }],
    };
    await schema.DockerImageModel.create(data);
    const { req, res } = createMocks({
      method: "POST",
      query: {
        token: token,
      },
      body: mockData.MockWebHookData,
    });

    //@ts-ignore
    await webhookHandler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    const dockerData = (await schema.DockerImageModel.findOne({
      imageName: "test/testhook",
    }).exec())!;
    expect(await schema.DockerImageModel.countDocuments()).toBe(1);
    expect(dockerData.tags.length).toBe(1);
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
    await schema.DockerImageModel.create(data1);
    await schema.DockerImageModel.create(data2);
    await schema.DockerImageModel.create(data3);
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
    const resultData: interfaces.PaginationResult<any> =
      res._getJSONData() as any;
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
        page: configs.Configurations.defaultPaginationStartingPage,
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //@ts-ignore
    await handler(req, res);
    const resultData: interfaces.PaginationResult<any> =
      res._getJSONData() as any;
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(resultData.count).toBe(0);
    expect(resultData.results.length).toBe(0);
  });

  test("When making a get request exceeds maximum page number", async () => {
    const data1 = {
      imageName: "test_data_1",
      tags: [{ tag: "v1.0" }],
    };

    await schema.DockerImageModel.create(data1);
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
    const resultData: interfaces.PaginationResult<any> =
      res._getJSONData() as any;
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(resultData.count).toBe(1);
    expect(resultData.results.length).toBe(0);
  });
});
