import mock = jest.mock;

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/installation-template/index";
import { createMocks } from "node-mocks-http";

import {
  MockDockerImage,
  MockInstallationTemplateData,
} from "../../data/mock_template_data";
import { StatusCodes } from "http-status-codes";
import { InstallationTemplateModel } from "../../../internal/services/dbSchema/install-script/install-script";
import { expect } from "@jest/globals";

mock("adm-zip");

describe("Given a installation template handler", () => {
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
      await InstallationTemplateModel.collection.drop();
      await DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a post request to the server with correct data", async () => {
    const result = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services.worker.image = result.tags[0]._id;
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
    expect(await InstallationTemplateModel.countDocuments()).toBe(1);
    const data = await InstallationTemplateModel.findOne({}).exec();
    expect(data.created_by).toBe(MockConstant.mockTestingUser);
  });

  test("When sending a post request to the server with incorrect image id but in right format", async () => {
    const result = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services.worker.image = result._id;
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
    const result = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services.worker.image = result._id;

    await InstallationTemplateModel.create(reqData);
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
