import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../../pages/api/v1/update-template/execution-plan/[id]";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";

describe("Given a update script api handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockTestingSecret
  );

  let mockUpdateScriptData: any;

  beforeAll(async () => {
    //@ts-ignore
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create({ binary: { version: "6.0.5" } });
    await mongoose.connect(
      dbServer.getUri().concat(mockData.MockConstant.mockDatabaseName)
    );
  });

  beforeEach(async () => {
    const data = (
      await schema.DockerImageModel.create(mockData.MockDockerImage)
    ).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    mockUpdateScriptData = JSON.parse(
      JSON.stringify(mockData.MockUpdateScriptData)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;
  });

  afterEach(async () => {
    await schema.UpdateScriptModel.deleteMany({});
    await schema.DockerImageModel.deleteMany({});
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling get", async () => {
    const updateScriptData = await schema.UpdateScriptModel.create(
      mockUpdateScriptData
    );

    await schema.ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: mockData.MockExecutionPlanName,
      description: mockData.MockExecutionPlanDescription,
    });

    await schema.ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: mockData.MockExecutionPlanName2,
      description: mockData.MockExecutionPlanDescription2,
    });

    await schema.ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: mockData.MockExecutionPlanName3,
      description: mockData.MockExecutionPlanDescription3,
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

    const data: interfaces.db.ExecutionPlanDBInterface[] = res._getJSONData();
    expect(data.length).toBe(3);
    expect(data[0].name).toBe(mockData.MockExecutionPlanName);
    expect(data[1].name).toBe(mockData.MockExecutionPlanName2);
    expect(data[2].name).toBe(mockData.MockExecutionPlanName3);
  });

  test("When calling delete", async () => {
    const updateScriptData = await schema.UpdateScriptModel.create(
      mockUpdateScriptData
    );

    await schema.ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: mockData.MockExecutionPlanName,
      description: mockData.MockExecutionPlanDescription,
    });

    await schema.ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: mockData.MockExecutionPlanName2,
      description: mockData.MockExecutionPlanDescription2,
    });

    await schema.ExecutionPlanModel.create({
      updateTemplate: updateScriptData._id,
      name: mockData.MockExecutionPlanName3,
      description: mockData.MockExecutionPlanDescription3,
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
      await schema.ExecutionPlanModel.countDocuments({
        updateTemplate: updateScriptData._id,
      })
    ).toBe(0);
  });

  test("When calling create", async () => {
    const updateScriptData = await schema.UpdateScriptModel.create(
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
        name: mockData.MockExecutionPlanName,
        description: mockData.MockExecutionPlanDescription,
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);

    expect(
      await schema.ExecutionPlanModel.countDocuments({
        updateTemplate: updateScriptData._id,
      })
    ).toBe(1);
  });

  test("When calling create without id", async () => {
    await schema.UpdateScriptModel.create(mockUpdateScriptData);

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: new ObjectId(),
      },
      data: {
        name: mockData.MockExecutionPlanName,
        description: mockData.MockExecutionPlanDescription,
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
