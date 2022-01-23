import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/static-node/[id]";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

describe("Given a static node handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockTestingSecret
  );
  let staticNodeId: string | undefined = undefined;

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
    staticNodeId = `${
      (await schema.StaticNodeModel.create(mockData.MockStaticNode))._id
    }`;
  });

  afterEach(async () => {
    try {
      await schema.StaticNodeModel.collection.drop();
    } catch (e) {}
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
        id: staticNodeId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: interfaces.db.StaticNodeDBInterface = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.nodeName).toBe(mockData.MockStaticNode.nodeName);
    expect(result.nodeURL).toBe(mockData.MockStaticNode.nodeURL);
  });

  test("When sending a patch request to the server", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: staticNodeId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: interfaces.db.StaticNodeDBInterface = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.nodeName).toBe(mockData.MockStaticNode.nodeName);
    expect(result.nodeURL).toBe(mockData.MockStaticNode.nodeURL);
  });

  test("When sending a delete request to the server", async () => {
    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        id: staticNodeId,
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
        id: staticNodeId,
      },
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
