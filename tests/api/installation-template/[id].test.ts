global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import {
  IInstallationTemplate,
  InstallationTemplateModel,
} from "../../../internal/services/dbSchema/install-script/install-script";
import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { MockStaticNode } from "../../data/mock_static_node";
import handler from "../../../pages/api/v1/installation-template/[id]";
import {
  MockDockerImage,
  MockInstallationTemplateData,
} from "../../data/mock_template_data";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";

describe("Given a installation template handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: MockConstant.mockTestingUser },
    MockConstant.mockTestingSecret
  );
  let templateId: string | undefined = undefined;

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
    const deepCopiedTemplate = JSON.parse(
      JSON.stringify(MockInstallationTemplateData)
    );
    deepCopiedTemplate.services[0].service.image.image = dockerImage._id;
    deepCopiedTemplate.services[0].service.image.image =
      dockerImage.tags[0]._id;

    const template = await InstallationTemplateModel.create(deepCopiedTemplate);
    templateId = `${template._id}`;
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
        id: templateId,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: IInstallationTemplate = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.template_tag).toBe(MockInstallationTemplateData.template_tag);
    expect(result.version).toBe(MockInstallationTemplateData.version);
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
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: IInstallationTemplate = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.template_tag).toBe(MockInstallationTemplateData.template_tag);
    expect(result.version).toBe(MockInstallationTemplateData.version);
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
        id: templateId,
      },
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
