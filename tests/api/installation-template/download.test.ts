import mock = jest.mock;

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  DockerImageModel,
  IDockerImage,
} from "../../../internal/services/dbSchema/docker/docker-image";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/installation-template/download/index";
import { createMocks } from "node-mocks-http";
import {
  MockComplicatedTemplateData,
  MockDockerImage,
  MockDockerImage2,
  MockInstallationTemplateData,
} from "../../data/mock_template_data";
import { StatusCodes } from "http-status-codes";
import { InstallationTemplateModel } from "../../../internal/services/dbSchema/install-script/install-script";
import { expect } from "@jest/globals";
import { InstallationPlugin } from "../../../internal/services/dbServices/installation-plugin";
import YAML from "yaml";
import { Configurations } from "../../../internal/const/configurations";

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
    dbServer = await MongoMemoryServer.create({
      binary: { version: Configurations.mongodbVersion },
    });
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

  test("When sending a post request to the server", async () => {
    const result = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services[0].service.image.image = result._id;
    reqData.services[0].service.image.tag = result.tags[0]._id;

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
    await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services[0].service.image = MockDockerImage;

    const returnResult = plguin.generateDockerComposeFile(reqData);
    expect(returnResult).toBeDefined();
    const parsedObject = YAML.parse(returnResult);
    expect(parsedObject.version).toBe(MockInstallationTemplateData.version);
    expect(parsedObject._id).toBeUndefined();
    expect(parsedObject.createdAt).toBeUndefined();
    expect(parsedObject.updatedAt).toBeUndefined();
    expect(parsedObject.services.worker.image).toBe(
      `${MockDockerImage.imageName}:${MockDockerImage.tags[0].tag}`
    );
  });

  test("When calling get a template with docker image", async () => {
    const result: IDockerImage = await DockerImageModel.create(MockDockerImage);
    const reqData = JSON.parse(JSON.stringify(MockInstallationTemplateData));
    reqData.services[0].service.image.image = result._id;
    reqData.services[0].service.image.tag = result.tags[0]._id;

    const templateResult = await InstallationTemplateModel.create(reqData);
    const templateWithDockerImage = await plguin.getTemplateWithDockerImages(
      templateResult._id
    );
    expect(templateWithDockerImage).toBeDefined();
    expect(templateWithDockerImage?.template_tag).toBe(
      MockInstallationTemplateData.template_tag
    );
    expect(templateWithDockerImage?.services[0].service.image!.imageName).toBe(
      MockInstallationTemplateData.services[0].service.image.imageName
    );
  });

  test("When calling get a template with multiple docker image", async () => {
    const result1: IDockerImage = await DockerImageModel.create(
      MockDockerImage
    );
    const result2: IDockerImage = await DockerImageModel.create(
      MockDockerImage2
    );

    const reqData = JSON.parse(JSON.stringify(MockComplicatedTemplateData));
    reqData.services[0].service.image.image = result1._id;
    reqData.services[0].service.image.tag = result1.tags[0]._id;

    reqData.services[1].service.image.image = result2._id;
    reqData.services[1].service.image.tag = result2.tags[0]._id;

    const templateResult = await InstallationTemplateModel.create(reqData);
    const templateWithDockerImage = await plguin.getTemplateWithDockerImages(
      templateResult._id
    );
    expect(templateWithDockerImage).toBeDefined();
    expect(templateWithDockerImage?.template_tag).toBe(
      MockComplicatedTemplateData.template_tag
    );
    expect(templateWithDockerImage?.services[0].service.image!.imageName).toBe(
      MockComplicatedTemplateData.services[0].service.image.imageName
    );
    expect(templateWithDockerImage?.services[1].service.image!.imageName).toBe(
      MockComplicatedTemplateData.services[1].service.image.imageName
    );
  });
});
