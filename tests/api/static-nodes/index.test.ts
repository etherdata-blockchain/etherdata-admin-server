import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import handler from "../../../pages/api/v1/static-node/index";
import { createMocks } from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

describe("Given a static node handler", () => {
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
    await schema.StaticNodeModel.deleteMany({});
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
      body: mockData.MockStaticNode,
    });
    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(await schema.StaticNodeModel.countDocuments()).toBe(1);
  });

  test("When sending a post request to the server", async () => {
    await schema.StaticNodeModel.create(mockData.MockStaticNode);
    await schema.StaticNodeModel.create(mockData.MockStaticNode);
    await schema.StaticNodeModel.create(mockData.MockStaticNode);

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
    const data: interfaces.PaginationResult<any> = res._getJSONData();
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(data.count).toBe(3);
    expect(data.results.length).toBe(2);
    expect(data.totalPage).toBe(2);
  });
});
