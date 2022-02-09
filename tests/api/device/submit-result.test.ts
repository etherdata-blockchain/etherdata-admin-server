import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/result/submit-result";
import mongoose from "mongoose";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { StatusCodes } from "http-status-codes";

describe("Given a result plugin", () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  beforeEach(async () => {
    await schema.StorageItemModel.create({
      qr_code: mockData.MockConstant.mockTestingUser,
    });
  });

  afterEach(async () => {
    await schema.JobResultModel.deleteMany({});
    await schema.PendingJobModel.deleteMany({});
    await schema.ExecutionPlanModel.deleteMany({});
    await schema.StorageItemModel.deleteMany({});
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When submitting a result with existing user", async () => {
    const pendingJob = await schema.PendingJobModel.create(
      mockData.MockPendingJob
    );
    const mockJobResultData = JSON.parse(
      JSON.stringify(mockData.MockJobResultData)
    );
    mockJobResultData.jobId = pendingJob._id;

    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockJobResultData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
  });

  test("When submit a result without existing user", async () => {
    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockInvalidTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockData.MockJobResultData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("When submitting a pending update template job", async () => {
    const pendingJob = await schema.PendingJobModel.create(
      mockData.MockPendingUpdateTemplateJob
    );
    const mockJobResultData = JSON.parse(
      JSON.stringify(mockData.MockJobResultData)
    );
    mockJobResultData.jobId = pendingJob._id;

    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockJobResultData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);

    const executionPlan = await schema.ExecutionPlanModel.findOne({}).exec();

    expect(executionPlan?.isError).toBeFalsy();
    expect(executionPlan?.isDone).toBeTruthy();
    expect(executionPlan?.updateTemplate).toStrictEqual(
      mockData.MockUpdateTemplate
    );

    expect(await schema.JobResultModel.countDocuments()).toBe(1);
  });

  test("When submitting a failed pending update template job", async () => {
    const pendingJob = await schema.PendingJobModel.create(
      mockData.MockPendingUpdateTemplateJob
    );
    const mockJobResultData = JSON.parse(
      JSON.stringify(mockData.MockFailedJobResultData)
    );
    mockJobResultData.jobId = pendingJob._id;

    const token = jwt.sign(
      { user: mockData.MockConstant.mockTestingUser },
      mockData.MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockJobResultData,
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);

    const executionPlan = await schema.ExecutionPlanModel.findOne({}).exec();

    expect(executionPlan?.isError).toBeTruthy();
    expect(executionPlan?.isDone).toBeTruthy();
    expect(executionPlan?.updateTemplate).toStrictEqual(
      mockData.MockUpdateTemplate
    );

    expect(await schema.JobResultModel.countDocuments()).toBe(1);
  });
});
