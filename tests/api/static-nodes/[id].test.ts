global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { MockConstant } from "../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/static_nodes/[id]";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { MockStaticNode } from "../data/mock_static_node";
import {
  IStaticNode,
  StaticNodeModel,
} from "../../../internal/services/dbSchema/install-script/static-node";

describe("Given a static node handler with index", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: MockConstant.mockTestingUser },
    MockConstant.mockTestingSecret
  );
  let staticNodeId: string | undefined = undefined;

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
    staticNodeId = `${(await StaticNodeModel.create(MockStaticNode))._id}`;
  });

  afterEach(async () => {
    try {
      await StaticNodeModel.collection.drop();
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
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: IStaticNode = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.nodeName).toBe(MockStaticNode.nodeName);
    expect(result.nodeURL).toBe(MockStaticNode.nodeURL);
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
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    const result: IStaticNode = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(result.nodeName).toBe(MockStaticNode.nodeName);
    expect(result.nodeURL).toBe(MockStaticNode.nodeURL);
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
      body: MockStaticNode,
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
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
