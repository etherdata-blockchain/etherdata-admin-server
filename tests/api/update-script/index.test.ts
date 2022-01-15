import { PaginationResult } from "../../../internal/const/common_interfaces";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { expect } from "@jest/globals";
import {
  IUpdateTemplate,
  UpdateScriptModel,
} from "../../../internal/services/dbSchema/update-template/update-template";

import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/update-template/index";
import { createMocks } from "node-mocks-http";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";
import { MockDockerImage } from "../../data/mock_docker_data";
import { MockUpdateScriptData } from "../../data/mock_update_script_data";
import { StatusCodes } from "http-status-codes";

describe("Given a update script api handler", () => {
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
      await UpdateScriptModel.collection.drop();
      await DockerImageModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling list", async () => {
    //getUpdateTemplateWithDockerImage
    const data = (await DockerImageModel.create(MockDockerImage)).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    const mockUpdateScriptData = JSON.parse(
      JSON.stringify(MockUpdateScriptData)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;

    await UpdateScriptModel.create(mockUpdateScriptData);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const jsonData: PaginationResult<IUpdateTemplate> = res._getJSONData();
    expect(jsonData.results.length).toBe(1);
    expect(jsonData.count).toBe(1);
  });

  test("When calling create", async () => {
    //getUpdateTemplateWithDockerImage
    const data = (await DockerImageModel.create(MockDockerImage)).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    const mockUpdateScriptData = JSON.parse(
      JSON.stringify(MockUpdateScriptData)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockUpdateScriptData,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.CREATED);
    expect(await UpdateScriptModel.countDocuments()).toBe(1);
  });
});
