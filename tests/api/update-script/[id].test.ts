import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/update-template/[id]";
import { createMocks } from "node-mocks-http";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { StatusCodes } from "http-status-codes";
import { MockUser } from "@etherdata-blockchain/common/src/mockdata/mock_storage_item";

export const MockUpdateScriptDataWithReplacement = {
  name: "Mock_template_1",
  description: "mock_description",
  targetDeviceIds: ["${{ etd_node_id }}"],
  targetGroupIds: ["group_id"],
  from: MockUser.user_id,
  time: new Date(),
  imageStacks: [
    {
      tag: "",
    },
  ],
  containerStacks: [
    {
      containerName: "my_container",
      image: {
        tag: "",
      },
    },
  ],
};

describe("Given a update script api handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
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
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(
      dbServer.getUri().concat(mockData.MockConstant.mockDatabaseName)
    );
  });

  afterEach(async () => {
    await schema.UpdateScriptModel.deleteMany({});
    await schema.DockerImageModel.deleteMany({});
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling get", async () => {
    const data = (
      await schema.DockerImageModel.create(mockData.MockDockerImage)
    ).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    const mockUpdateScriptData = JSON.parse(
      JSON.stringify(mockData.MockUpdateScriptData)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;

    const updateScriptData = await schema.UpdateScriptModel.create(
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
    const jsonData: interfaces.db.UpdateTemplateWithDockerImageDBInterface =
      res._getJSONData();
    expect(jsonData._id).toStrictEqual(updateScriptData._id.toString());
    expect(jsonData.containerStacks[0].image.imageName).toBe(
      mockData.MockDockerImage.imageName
    );
  });

  test("When calling get with replacement", async () => {
    const data = (
      await schema.DockerImageModel.create(mockData.MockDockerImage)
    ).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    const mockUpdateScriptData = JSON.parse(
      JSON.stringify(MockUpdateScriptDataWithReplacement)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;

    const updateScriptData = await schema.UpdateScriptModel.create(
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
    const jsonData: interfaces.db.UpdateTemplateWithDockerImageDBInterface =
      res._getJSONData();
    expect(jsonData._id).toStrictEqual(updateScriptData._id.toString());
    expect(jsonData.containerStacks[0].image.imageName).toBe(
      mockData.MockDockerImage.imageName
    );
    expect(jsonData.targetDeviceIds[0]).toBe("test-user");
  });

  test("When calling delete", async () => {
    //getUpdateTemplateWithDockerImage
    const data = (
      await schema.DockerImageModel.create(mockData.MockDockerImage)
    ).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    const mockUpdateScriptData = JSON.parse(
      JSON.stringify(mockData.MockUpdateScriptData)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;

    const updateScriptData = await schema.UpdateScriptModel.create(
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
    expect(await schema.UpdateScriptModel.countDocuments()).toBe(0);
  });
});
