import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/update-template/run/[id]";
import { createMocks } from "node-mocks-http";
import { mockData, utils } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { dbServices } from "@etherdata-blockchain/services";
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
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(
      dbServer.getUri().concat(mockData.MockConstant.mockDatabaseName)
    );
  });

  beforeEach(async () => {
    //getUpdateTemplateWithDockerImage
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
    await schema.StorageOwnerModel.deleteMany({});
    await schema.StorageItemModel.deleteMany({});
    await schema.PendingJobModel.deleteMany({});
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling post", async () => {
    await schema.StorageOwnerModel.create(mockData.MockUser);
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);

    const executionPlanService = new dbServices.ExecutionPlanService();
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
      body: {
        targetDeviceIds: updateScriptData.targetDeviceIds,
        targetGroupIds: [mockData.MockUser.user_id],
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);

    await utils.sleep(200);
    const plans = (await executionPlanService.getPlans(updateScriptData._id))!;
    expect(plans?.length).toBe(2);
    expect(plans[0].isDone).toBeTruthy();
    expect(plans[1].isDone).toBeTruthy();
    expect(await schema.PendingJobModel.countDocuments({})).toBe(3);
  });

  test("When calling post", async () => {
    const executionPlanService = new dbServices.ExecutionPlanService();
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
      body: {
        targetDeviceIds: ["mock_ids", "mock_ids_2"],
      },
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);

    await utils.sleep(200);
    const plans = (await executionPlanService.getPlans(updateScriptData._id))!;
    expect(plans?.length).toBe(2);
    expect(plans[0].isDone).toBeTruthy();
    expect(plans[1].isDone).toBeTruthy();

    const newTemplate = await schema.UpdateScriptModel.findOne({
      _id: updateScriptData._id,
    });
    expect(newTemplate!.targetDeviceIds).toStrictEqual([
      "mock_ids",
      "mock_ids_2",
    ]);
  });

  test("When calling post without group ids", async () => {
    await schema.StorageOwnerModel.create(mockData.MockUser);
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem2);

    const executionPlanService = new dbServices.ExecutionPlanService();
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
      body: {
        targetGroupIds: [mockData.MockUser.user_id],
      },
    });

    await handler(req as any, res as any);
    expect(res.statusCode).toBe(StatusCodes.OK);

    await utils.sleep(200);
    const plans = (await executionPlanService.getPlans(updateScriptData._id))!;
    expect(plans?.length).toBe(2);
    expect(plans[0].isDone).toBeTruthy();
    expect(plans[1].isDone).toBeTruthy();
    expect(await schema.PendingJobModel.countDocuments({})).toBe(2);

    const updatedTemplate = await schema.UpdateScriptModel.findOne({
      _id: updateScriptData._id,
    });
    expect(updatedTemplate!.targetGroupIds).toHaveLength(1);
    expect(updatedTemplate!.targetDeviceIds).toHaveLength(0);
  });

  test("When calling post without group ids", async () => {
    await schema.StorageOwnerModel.create(mockData.MockUser);
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create({
      qr_code: null,
      owner_id: mockData.MockUser.user_id,
    });

    const executionPlanService = new dbServices.ExecutionPlanService();
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
      body: {
        targetGroupIds: [mockData.MockUser.user_id],
      },
    });

    await handler(req as any, res as any);
    expect(res.statusCode).toBe(StatusCodes.OK);

    await utils.sleep(200);
    const plans = (await executionPlanService.getPlans(updateScriptData._id))!;
    expect(plans?.length).toBe(2);
    expect(plans[0].isDone).toBeTruthy();
    expect(plans[1].isDone).toBeTruthy();
    expect(await schema.PendingJobModel.countDocuments({})).toBe(1);

    const updatedTemplate = await schema.UpdateScriptModel.findOne({
      _id: updateScriptData._id,
    });
    expect(updatedTemplate!.targetGroupIds).toHaveLength(1);
    expect(updatedTemplate!.targetDeviceIds).toHaveLength(0);
  });
});
