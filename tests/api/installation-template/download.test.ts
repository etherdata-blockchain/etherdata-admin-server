import mock = jest.mock;
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/installation-template/download/index";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { configs, mockData } from "@etherdata-blockchain/common";
import YAML from "yaml";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";

mock("adm-zip");

describe("Given a installation template download handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const plugin = new dbServices.InstallationService();
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
    dbServer = await MongoMemoryServer.create({
      binary: { version: configs.Configurations.mongodbVersion },
    });
    await mongoose.connect(
      dbServer.getUri().concat(mockData.MockConstant.mockDatabaseName)
    );
  });

  afterEach(async () => {
    await schema.InstallationTemplateModel.deleteMany({});
    await schema.DockerImageModel.deleteMany({});
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a post request to the server", async () => {
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
    await schema.DockerImageModel.create(mockData.MockDockerImage);
    const reqData = JSON.parse(
      JSON.stringify(mockData.MockInstallationTemplateData)
    );
    const deepCopiedImage = JSON.parse(
      JSON.stringify(mockData.MockDockerImage)
    );
    deepCopiedImage.tag = deepCopiedImage.tags[0];
    reqData.services[0].service.image = deepCopiedImage;

    const returnResult = plugin.generateDockerComposeFile(reqData);
    expect(returnResult).toBeDefined();
    const parsedObject = YAML.parse(returnResult);
    expect(parsedObject.version).toBe(
      mockData.MockInstallationTemplateData.version
    );
    expect(parsedObject._id).toBeUndefined();
    expect(parsedObject.createdAt).toBeUndefined();
    expect(parsedObject.updatedAt).toBeUndefined();
    expect(parsedObject.services.worker.image).toBe(
      `${mockData.MockDockerImage.imageName}:${mockData.MockDockerImage.tags[0].tag}`
    );
  });

  test("When calling get a template with docker image", async () => {
    const result = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    const reqData = JSON.parse(
      JSON.stringify(mockData.MockInstallationTemplateData)
    );
    reqData.services[0].service.image.image = result._id;
    reqData.services[0].service.image.tag = result.tags[0]._id;

    const templateResult = await schema.InstallationTemplateModel.create(
      reqData
    );
    const templateWithDockerImage = await plugin.getTemplateWithDockerImages(
      templateResult._id
    );
    expect(templateWithDockerImage).toBeDefined();
    expect(templateWithDockerImage?.template_tag).toBe(
      mockData.MockInstallationTemplateData.template_tag
    );
    expect(templateWithDockerImage?.services[0].service.image!.imageName).toBe(
      mockData.MockInstallationTemplateData.services[0].service.image.imageName
    );
  });

  test("When calling get a template with multiple docker image", async () => {
    const result1 = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    const result2 = await schema.DockerImageModel.create(
      mockData.MockDockerImage3
    );

    console.log(JSON.stringify(result1, null, 4));
    console.log(JSON.stringify(result2, null, 4));

    const reqData = JSON.parse(
      JSON.stringify(mockData.MockComplicatedTemplateData)
    );
    reqData.services[0].service.image.image = result1._id;
    reqData.services[0].service.image.tag = result1.tags[0]._id;

    reqData.services[1].service.image.image = result2._id;
    reqData.services[1].service.image.tag = result2.tags[0]._id;

    const templateResult = await schema.InstallationTemplateModel.create(
      reqData
    );
    const templateWithDockerImage = await plugin.getTemplateWithDockerImages(
      templateResult._id
    );
    expect(templateWithDockerImage).toBeDefined();
    expect(templateWithDockerImage?.template_tag).toBe(
      mockData.MockComplicatedTemplateData.template_tag
    );
    expect(templateWithDockerImage?.services[0].service.image!.imageName).toBe(
      mockData.MockComplicatedTemplateData.services[0].service.image.imageName
    );
    expect(templateWithDockerImage?.services[1].service.image!.imageName).toBe(
      mockData.MockComplicatedTemplateData.services[1].service.image.imageName
    );
  });
});
