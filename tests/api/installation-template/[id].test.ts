import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import handler from "../../../pages/api/v1/installation-template/[id]";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

describe("Given a installation template handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockTestingSecret
  );
  let templateId: string | undefined = undefined;

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
    const dockerImage = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    const deepCopiedTemplate = JSON.parse(
      JSON.stringify(mockData.MockInstallationTemplateData)
    );
    deepCopiedTemplate.services[0].service.image.image = dockerImage._id;
    deepCopiedTemplate.services[0].service.image.tag = dockerImage.tags[0]._id;

    const template = await schema.InstallationTemplateModel.create(
      deepCopiedTemplate
    );
    templateId = `${template._id}`;
  });

  afterEach(async () => {
    await schema.InstallationTemplateModel.deleteMany({});
    await schema.DockerImageModel.deleteMany({});
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
        id: templateId,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: schema.IInstallationTemplate = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.template_tag).toBe(
      mockData.MockInstallationTemplateData.template_tag
    );
    expect(result.version).toBe(mockData.MockInstallationTemplateData.version);
  });

  test("When sending a patch request to the server", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: templateId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: schema.IInstallationTemplate = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.template_tag).toBe(
      mockData.MockInstallationTemplateData.template_tag
    );
    expect(result.version).toBe(mockData.MockInstallationTemplateData.version);
  });

  test("When sending a delete request to the server", async () => {
    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: templateId,
      },
      body: mockData.MockStaticNode,
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
        id: templateId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
