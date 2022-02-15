import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/job/get-job";
import { enums, interfaces, mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { StatusCodes } from "http-status-codes";

describe("Given a pending job", () => {
  let dbServer: MongoMemoryServer;
  const oldEnv = process.env;

  beforeAll(async () => {
    process.env = {
      ...oldEnv,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  beforeEach(async () => {
    await schema.StorageItemModel.create(mockData.MockStorageItem);
    await schema.StorageItemModel.create(mockData.MockStorageItem3);
    await schema.StorageOwnerModel.create(mockData.MockUser);
  });

  afterEach(async () => {
    await schema.PendingJobModel.deleteMany({});
    await schema.StorageItemModel.deleteMany({});
    await schema.StorageOwnerModel.deleteMany({});
  });

  afterAll(async () => {
    await dbServer.stop();
    await mongoose.disconnect();
  });

  test("When calling get a pending job", async () => {
    const data: any = {
      from: "abcde",
      targetDeviceId: mockData.MockDeviceID,
      task: {
        type: "rpc",
        value: "",
      },
      time: new Date(),
    };
    await schema.PendingJobModel.create(data);

    const token = jwt.sign(
      { user: mockData.MockDeviceID },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });

  test("When calling get a pending update template job", async () => {
    const data: interfaces.db.PendingJobDBInterface<enums.UpdateTemplateValueType> =
      {
        from: "abcde",
        targetDeviceId: mockData.MockDeviceID,
        task: {
          type: enums.JobTaskType.UpdateTemplate,
          value: {
            templateId: mockData.MockUpdateTemplate.toHexString(),
          },
        },
        createdAt: new Date().toISOString(),
        retrieved: false,
        tries: 0,
      };
    await schema.PendingJobModel.create(data);

    const token = jwt.sign(
      { user: mockData.MockDeviceID },
      mockData.MockConstant.mockTestingSecret
    );

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const returnedData = res._getJSONData();
    const job =
      returnedData.job as schema.IPendingJob<enums.UpdateTemplateValueType>;
    expect(job).toBeDefined();
    expect((job.task.value as enums.UpdateTemplateValueType).coinbase).toBe(
      mockData.MockUser.coinbase
    );
    expect((job.task.value as enums.UpdateTemplateValueType).templateId).toBe(
      mockData.MockUpdateTemplate.toHexString()
    );
  });

  test("When calling get a pending update template job with no storage owner found", async () => {
    const data: interfaces.db.PendingJobDBInterface<enums.UpdateTemplateValueType> =
      {
        from: "abcde",
        targetDeviceId: mockData.MockDeviceID3,
        task: {
          type: enums.JobTaskType.UpdateTemplate,
          value: {
            templateId: mockData.MockUpdateTemplate.toHexString(),
          },
        },
        createdAt: new Date().toISOString(),
        retrieved: false,
        tries: 0,
      };
    await schema.PendingJobModel.create(data);

    const token = jwt.sign(
      { user: mockData.MockDeviceID3 },
      mockData.MockConstant.mockTestingSecret
    );

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockDeviceData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    const returnedData = res._getJSONData();
    const job =
      returnedData.job as schema.IPendingJob<enums.UpdateTemplateValueType>;
    expect(job).toBeDefined();
    expect(
      (job.task.value as enums.UpdateTemplateValueType).coinbase
    ).toBeUndefined();
  });
});
