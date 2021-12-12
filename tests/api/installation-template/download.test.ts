import mock = jest.mock;

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/installation-template/download/index";
import { createMocks } from "node-mocks-http";

import {
  MockDockerImage,
  MockInstallationTemplateData,
} from "../../data/mock_template_data";
import { StatusCodes } from "http-status-codes";
import { InstallationTemplateModel } from "../../../internal/services/dbSchema/install-script/install-script";
import { expect } from "@jest/globals";
import { InstallationPlugin } from "../../../internal/services/dbServices/installation-plugin";

mock("adm-zip");

describe("Given a installation template download handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const plguin = new InstallationPlugin();
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

  test("When trying to generate a env file", () => {
    const result = plguin.generateEnvFile({ name: "hello", value: 1 });
    expect(result).toBe("name=hello\nvalue=1\n");
  });

  test("When sending a list request to the server", async () => {
    const result = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services.worker.image = result._id;

    await InstallationTemplateModel.create(reqData);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        template: reqData.template_tag,
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getData()).toBeDefined();
  });

  test("When generating a docker compose file", async () => {
    const result = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services.worker.image = result._id;

    const returnResult = plguin.generateDockerComposeFile(reqData);
    expect(returnResult).toBeDefined();
  });
});
