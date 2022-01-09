import { before } from "lodash";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { IUpdateScriptWithDockerImage } from "../../../internal/services/dbServices/update-script-plugin";
import { PendingJobModel } from "../../../internal/services/dbSchema/queue/pending-job";

import { MockConstant } from "../../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/update-template/run/[id]";
import { createMocks } from "node-mocks-http";
import { DockerImageModel } from "../../../internal/services/dbSchema/docker/docker-image";
import { MockDockerImage } from "../../data/mock_docker_data";
import { MockUpdateScriptData } from "../../data/mock_update_script_data";
import { StatusCodes } from "http-status-codes";
import { UpdateScriptModel } from "../../../internal/services/dbSchema/update-template/update-template";
import { ExecutionPlanPlugin } from "../../../internal/services/dbServices/execution-plan-plugin";
import { sleep } from "../../../internal/utils/sleep";

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
    //getUpdateTemplateWithDockerImage
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
      await PendingJobModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling post", async () => {
    const executionPlanPlugin = new ExecutionPlanPlugin();
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
    });
    //@ts-ignore
    await handler(req, res);
    expect(res.statusCode).toBe(StatusCodes.OK);

    await sleep(200);
    const plans = (await executionPlanPlugin.getPlans(updateScriptData._id))!;
    expect(plans?.length).toBe(2);
    expect(plans[0].isDone).toBeTruthy();
    expect(plans[1].isDone).toBeTruthy();
  });
});
