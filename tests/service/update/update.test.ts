global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { DockerImagePlugin } from "../../../internal/services/dbServices/docker-image-plugin";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  IUpdateTemplate,
  UpdateScriptModel,
} from "../../../internal/services/dbSchema/update-template/update-template";
import { MockDockerImage, MockDockerImage2 } from "../../data/mock_docker_data";
import {
  MockUpdateScriptData,
  MockUpdateScriptData2,
} from "../../data/mock_update_script_data";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";
import { UpdateScriptPlugin } from "../../../internal/services/dbServices/update-script-plugin";
import { expect } from "@jest/globals";

describe("Given a update-script-script plugin", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
      await UpdateScriptModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling getUpdateTemplateWithDockerImage", async () => {
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

    const createdData: IUpdateTemplate = await UpdateScriptModel.create(
      mockUpdateScriptData
    );
    expect(createdData.imageStacks[0].image).toBe(imageId);
    expect(createdData.containerStacks[0].image.image).toBe(imageId);

    expect(createdData.imageStacks[0].tag).toBe(tagId);
    expect(createdData.containerStacks[0].image.tag).toBe(tagId);

    const plugin = new UpdateScriptPlugin();
    const result = (await plugin.getUpdateTemplateWithDockerImage(
      createdData._id.toString()
    ))!;
    expect(result._id).toStrictEqual(createdData._id);
    expect(result.targetGroupIds).toStrictEqual(createdData.targetGroupIds);
    expect(result.targetDeviceIds).toStrictEqual(createdData.targetDeviceIds);
    expect(result.imageStacks[0].imageName).toStrictEqual(
      MockDockerImage.imageName
    );
    expect(result.imageStacks[0].tags.tag).toStrictEqual(
      MockDockerImage.tags[0].tag
    );
  });

  test("When calling getUpdateTemplateWithDockerImage if no image exists", async () => {
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

    const createdData: IUpdateTemplate = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    await DockerImageModel.findOneAndDelete({ _id: data._id });
    const dockerImagePlugin = new DockerImagePlugin();
    await dockerImagePlugin.delete(imageId);

    const plugin = new UpdateScriptPlugin();
    const result = (await plugin.getUpdateTemplateWithDockerImage(
      createdData._id.toString()
    ))!;
    expect(result).toBeDefined();
    expect(result.imageStacks.length).toBe(0);
    expect(result.containerStacks[0].image).toBeUndefined();
  });

  test("When calling getUpdateTemplateWithDockerImage if some images doesn't exist", async () => {
    const data = (await DockerImageModel.create(MockDockerImage)).toJSON();
    const data2 = (await DockerImageModel.create(MockDockerImage2)).toJSON();

    const imageId = data._id;
    const tagId = data.tags[0]._id;

    const imageId2 = data2._id;
    const tagId2 = data.tags[0]._id;

    const mockUpdateScriptData = JSON.parse(
      JSON.stringify(MockUpdateScriptData2)
    );

    mockUpdateScriptData.imageStacks[0].tag = tagId;
    mockUpdateScriptData.imageStacks[0].image = imageId;

    mockUpdateScriptData.imageStacks[1].tag = tagId2;
    mockUpdateScriptData.imageStacks[1].image = imageId2;

    mockUpdateScriptData.containerStacks[0].image.image = imageId;
    mockUpdateScriptData.containerStacks[0].image.tag = tagId;

    mockUpdateScriptData.containerStacks[1].image.image = imageId2;
    mockUpdateScriptData.containerStacks[1].image.tag = tagId2;

    const createdData: IUpdateTemplate = await UpdateScriptModel.create(
      mockUpdateScriptData
    );

    const dockerImagePlugin = new DockerImagePlugin();
    await dockerImagePlugin.delete(imageId);

    const plugin = new UpdateScriptPlugin();
    const result = (await plugin.getUpdateTemplateWithDockerImage(
      createdData._id
    ))!;
    expect(result).toBeDefined();
    expect(result.imageStacks.length).toBe(1);
    expect(result.containerStacks[0].image).toBeUndefined();
  });
});
