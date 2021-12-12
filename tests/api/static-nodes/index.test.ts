global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { PaginationResult } from "../../../server/plugin/basePlugin";
import { MockConstant } from "../data/mock_constant";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/static_nodes/index";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { MockStaticNode } from "../data/mock_static_node";
import { StaticNodeModel } from "../../../internal/services/dbSchema/install-script/static-node";

describe("Given a static node handler", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;
  const token = jwt.sign(
    { user: MockConstant.mockTestingUser },
    MockConstant.mockTestingSecret
  );

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

  afterEach(async () => {
    try {
      await StaticNodeModel.collection.drop();
    } catch (e) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When sending a post request to the server", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await StaticNodeModel.countDocuments()).toBe(1);
  });

  test("When sending a post request to the server", async () => {
    await StaticNodeModel.create(MockStaticNode);
    await StaticNodeModel.create(MockStaticNode);
    await StaticNodeModel.create(MockStaticNode);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      query: {
        pageSize: 2,
      },
    });
    //@ts-ignore
    await handler(req, res);
    const data: PaginationResult<any> = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(data.count).toBe(3);
    expect(data.results.length).toBe(2);
    expect(data.totalPage).toBe(2);
  });
});
