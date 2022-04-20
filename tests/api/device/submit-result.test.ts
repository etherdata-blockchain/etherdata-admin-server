import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/result/submit-result";
import mongoose from "mongoose";
import { mockData } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { StatusCodes } from "http-status-codes";
import { MockPendingUpdateTemplate2Job } from "@etherdata-blockchain/common/src/mockdata/mock_pending_job";
import { MockDeviceID } from "@etherdata-blockchain/common/src/mockdata/mock_storage_item";

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

  test("When submitting a pending update template job multiple", async () => {
    const plan = {
      description: "Waiting for job result",
      isDone: false,
      isError: false,
      name: `${mockData.MockDeviceID} received job`,
      updateTemplate: mockData.MockUpdateTemplate.toHexString(),
    };

    const plan2 = {
      description: "Waiting for job result",
      isDone: false,
      isError: false,
      name: `${mockData.MockDeviceID2} received job`,
      updateTemplate: mockData.MockUpdateTemplate.toHexString(),
    };

    await schema.ExecutionPlanModel.create(plan);
    await schema.ExecutionPlanModel.create(plan2);

    const pendingJob = await schema.PendingJobModel.create(
      mockData.MockPendingUpdateTemplateJob
    );
    const pendingJob2 = await schema.PendingJobModel.create(
      mockData.MockPendingUpdateTemplate2Job
    );

    const mockJobResultData = JSON.parse(
      JSON.stringify(mockData.MockJobResultData)
    );
    const mockJobResultData2 = JSON.parse(
      JSON.stringify(mockData.MockJobResultData)
    );

    mockJobResultData.jobId = pendingJob._id;
    mockJobResultData2.jobId = pendingJob2._id;

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

    const { req: req2, res: res2 } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: mockJobResultData2,
    });

    //@ts-ignore
    await handler(req2, res2);

    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(res2._getStatusCode()).toBe(StatusCodes.CREATED);

    const executionPlan = await schema.ExecutionPlanModel.find({}).exec();
    expect(executionPlan.length).toBe(4);

    expect(executionPlan[0]?.isError).toBeFalsy();
    expect(executionPlan[0]?.isDone).toBeTruthy();
    expect(executionPlan[0]?.updateTemplate.toString()).toStrictEqual(
      mockData.MockUpdateTemplate.toString()
    );

    expect(executionPlan[1]?.isError).toBeFalsy();
    expect(executionPlan[1]?.isDone).toBeTruthy();
    expect(executionPlan[1]?.updateTemplate.toString()).toStrictEqual(
      mockData.MockUpdateTemplate.toString()
    );

    expect(executionPlan[2]?.isError).toBeFalsy();
    expect(executionPlan[2]?.isDone).toBeTruthy();
    expect(executionPlan[2]?.updateTemplate.toString()).toStrictEqual(
      mockData.MockUpdateTemplate.toString()
    );

    expect(executionPlan[3]?.isError).toBeFalsy();
    expect(executionPlan[3]?.isDone).toBeTruthy();
    expect(executionPlan[3]?.updateTemplate.toString()).toStrictEqual(
      mockData.MockUpdateTemplate.toString()
    );

    expect(await schema.JobResultModel.countDocuments()).toBe(2);
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
    expect(executionPlan?.updateTemplate.toString()).toStrictEqual(
      mockData.MockUpdateTemplate.toString()
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
    expect(executionPlan?.updateTemplate.toString()).toStrictEqual(
      mockData.MockUpdateTemplate.toString()
    );

    expect(await schema.JobResultModel.countDocuments()).toBe(1);
  });
});
