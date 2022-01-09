global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { ObjectId } from "mongodb";

import { MockConstant } from "../../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../../pages/api/v1/update-template/execution-plan/[id]";

import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { UpdateScriptModel } from "../../../../internal/services/dbSchema/update-template/update-template";
import { DockerImageModel } from "../../../../internal/services/dbSchema/docker/docker-image";
import { MockDockerImage } from "../../../data/mock_docker_data";
import { MockUpdateScriptData } from "../../../data/mock_update_script_data";
import {
  ExecutionPlanModel,
  IExecutionPlan,
} from "../../../../internal/services/dbSchema/update-template/execution_plan";
import {
  MockExecutionPlanDescription,
  MockExecutionPlanDescription2,
  MockExecutionPlanDescription3,
  MockExecutionPlanName,
  MockExecutionPlanName2,
  MockExecutionPlanName3,
} from "../../../data/mock_execution_plan";

describe("Given a update script api handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: MockConstant.mockTestingUser },
    MockConstant.mockTestingSecret
  );

  let mockUpdateScriptData: any;

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
    const data = (await DockerImageModel.create(MockDockerImage)).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    mockUpdateScriptData = JSON.parse(JSON.stringify(MockUpdateScriptData));

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;
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
    const updateScriptData = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    await ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: MockExecutionPlanName,
      description: MockExecutionPlanDescription,
    });

    await ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: MockExecutionPlanName2,
      description: MockExecutionPlanDescription2,
    });

    await ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: MockExecutionPlanName3,
      description: MockExecutionPlanDescription3,
    });

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

    const data: IExecutionPlan[] = res._getJSONData();
    expect(data.length).toBe(3);
    expect(data[0].name).toBe(MockExecutionPlanName);
    expect(data[1].name).toBe(MockExecutionPlanName2);
    expect(data[2].name).toBe(MockExecutionPlanName3);
  });

  test("When calling delete", async () => {
    const updateScriptData = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    await ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: MockExecutionPlanName,
      description: MockExecutionPlanDescription,
    });

    await ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: MockExecutionPlanName2,
      description: MockExecutionPlanDescription2,
    });

    await ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: MockExecutionPlanName3,
      description: MockExecutionPlanDescription3,
    });

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

    expect(
      await ExecutionPlanModel.countDocuments({
        updateTemplate: updateScriptData._id,
      })
    ).toBe(0);
  });

  test("When calling create", async () => {
    const updateScriptData = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: updateScriptData._id.toString(),
      },
      data: {
        name: MockExecutionPlanName,
        description: MockExecutionPlanDescription,
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);

    expect(
      await ExecutionPlanModel.countDocuments({
        updateTemplate: updateScriptData._id,
      })
    ).toBe(1);
  });

  test("When calling create without id", async () => {
    await UpdateScriptModel.create(mockUpdateScriptData);

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: new ObjectId(),
      },
      data: {
        name: MockExecutionPlanName,
        description: MockExecutionPlanDescription,
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
