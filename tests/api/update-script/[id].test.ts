global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { IUpdateScriptWithDockerImage } from "../../../internal/services/dbServices/update-script-plugin";
import { UpdateScriptModel } from "../../../internal/services/dbSchema/update-template/update_script";

import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/update-script/[id]";
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

  test("When calling get", async () => {
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

    const updateScriptData = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: updateScriptData._id.toString(),
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);
    const jsonData: IUpdateScriptWithDockerImage = res._getJSONData();
    expect(jsonData._id).toStrictEqual(updateScriptData._id.toString());
    expect(jsonData.containerStacks[0].image.imageName).toBe(
      MockDockerImage.imageName
    );
  });

  test("When calling delete", async () => {
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

    const updateScriptData = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: updateScriptData._id.toString(),
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(await UpdateScriptModel.countDocuments()).toBe(0);
  });
});
