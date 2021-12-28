global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  IUpdateScript,
  UpdateScriptModel,
} from "../../../internal/services/dbSchema/update-template/update_script";
import { MockDockerImage } from "../../data/mock_docker_data";
import { MockUpdateScriptData } from "../../data/mock_update_script_data";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";
import { UpdateScriptPlugin } from "../../../internal/services/dbServices/update-script-plugin";
import { expect } from "@jest/globals";

describe("Given a update-script plugin", () => {
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

    const createdData: IUpdateScript = await UpdateScriptModel.create(
      mockUpdateScriptData
    );
    expect(createdData.imageStacks[0].image).toBe(imageId);
    expect(createdData.containerStacks[0].image.image).toBe(imageId);

    expect(createdData.imageStacks[0].tag).toBe(tagId);
    expect(createdData.containerStacks[0].image.tag).toBe(tagId);

    const plugin = new UpdateScriptPlugin();
    const result = await plugin.getUpdateTemplateWithDockerImage();
    expect(result._id).toStrictEqual(createdData._id);
    expect(result.targetGroupId).toStrictEqual(createdData.targetGroupId);
    expect(result.targetDeviceId).toStrictEqual(createdData.targetDeviceId);
    // @ts-ignore
    expect(result.imageStacks[0].imageName).toStrictEqual(
      MockDockerImage.imageName
    );
    // @ts-ignore
    expect(result.imageStacks[0].tags.tag).toStrictEqual(
      MockDockerImage.tags[0].tag
    );
  });
});
