import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { mockData, interfaces, configs } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import handler from "../../../pages/api/v1/docker/[id]";

describe("Given a docker image handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockTestingSecret
  );
  let dockerImageId: string | undefined = undefined;

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
    const dockerImage = await schema.DockerImageModel.create(
      mockData.MockDockerImage
    );
    dockerImageId = `${dockerImage._id}`;
  });

  afterEach(async () => {
    await schema.InstallationTemplateModel.deleteMany({});
    await schema.DockerImageModel.collection.drop();
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
        id: dockerImageId,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const result: interfaces.db.DockerImageDBInterface = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.tags.length).toBe(mockData.MockDockerImage.tags.length);
    expect(result.imageName).toBe(mockData.MockDockerImage.imageName);
  });

  test("When sending a patch request to the server", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: dockerImageId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: interfaces.db.DockerImageDBInterface = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.tags.length).toBe(mockData.MockDockerImage.tags.length);
    expect(result.imageName).toBe(mockData.MockDockerImage.imageName);
  });

  test("When sending a delete request to the server", async () => {
    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: dockerImageId,
      },
      body: mockData.MockStaticNode,
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
        id: dockerImageId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
