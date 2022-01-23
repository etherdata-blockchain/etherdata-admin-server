import mock = jest.mock;
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/installation-template/index";
import { createMocks } from "node-mocks-http";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { StatusCodes } from "http-status-codes";
import { expect } from "@jest/globals";

mock("adm-zip");

describe("Given a installation template handler", () => {
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

  afterEach(async () => {
    try {
      await schema.InstallationTemplateModel.collection.drop();
      await schema.DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a post request to the server with correct data", async () => {
    const result = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    const reqData = JSON.parse(
      JSON.stringify(mockData.MockInstallationTemplateData)
    );
    reqData.services[0].service.image.image = result._id;
    reqData.services[0].service.image.tag = result.tags[0]._id;
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: reqData,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await schema.InstallationTemplateModel.countDocuments()).toBe(1);
    const data = await schema.InstallationTemplateModel.findOne({}).exec();
    expect(data.created_by).toBe(mockData.MockConstant.mockTestingUser);
  });

  test("When sending a post request to the server with incorrect image id but in right format", async () => {
    const result = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    const reqData = JSON.parse(
      JSON.stringify(mockData.MockInstallationTemplateData)
    );
    reqData.services[0].service.image.image = result._id;
    reqData.services[0].service.image.tag = result._id;
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: reqData,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  test("When sending a list request to the server", async () => {
    const result = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    const reqData = JSON.parse(
      JSON.stringify(mockData.MockInstallationTemplateData)
    );
    reqData.services[0].service.image.image = result._id;
    reqData.services[0].service.image.tag = result.tags[0]._id;

    await schema.InstallationTemplateModel.create(reqData);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getJSONData()).toBeDefined();
  });
});
