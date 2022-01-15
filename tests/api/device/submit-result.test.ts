import { ExecutionPlanModel } from "../../../internal/services/dbSchema/update-template/execution_plan";
import {
  MockFailedJobResultData,
  MockJobResultData,
} from "../../data/mock_job_result_data";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import handler from "../../../pages/api/v1/device/result/submit-result";
import mongoose from "mongoose";
import { StorageManagementItemPlugin } from "../../../internal/services/dbServices/storage-management-item-plugin";
import { MockConstant } from "../../data/mock_constant";
import { StatusCodes } from "http-status-codes";
import { JobResultModel } from "../../../internal/services/dbSchema/queue/job-result";
import { PendingJobModel } from "../../../internal/services/dbSchema/queue/pending-job";
import {
  MockPendingJob,
  MockPendingUpdateTemplateJob,
  MockUpdateTemplate,
} from "../../data/mock_pending_job";

jest.mock(
  "../../../internal/services/dbServices/storage-management-item-plugin"
);

describe("Given a result plugin", () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
      await JobResultModel.collection.drop();
      await PendingJobModel.collection.drop();
      await ExecutionPlanModel.collection.drop();
    } catch (err) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When submit a result with existing user", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const pendingJob = await PendingJobModel.create(MockPendingJob);
    const mockJobResultData = JSON.parse(JSON.stringify(MockJobResultData));
    mockJobResultData.jobId = pendingJob._id;

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: mockJobResultData,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
  });

  test("When submit a result without existing user", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockInvalidTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: MockJobResultData,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("When submitting a pending update template job", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const pendingJob = await PendingJobModel.create(
      MockPendingUpdateTemplateJob
    );
    const mockJobResultData = JSON.parse(JSON.stringify(MockJobResultData));
    mockJobResultData.jobId = pendingJob._id;

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: mockJobResultData,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);

    const executionPlan = await ExecutionPlanModel.findOne({}).exec();

    expect(executionPlan?.isError).toBeFalsy();
    expect(executionPlan?.isDone).toBeTruthy();
    expect(executionPlan?.updateTemplate).toStrictEqual(MockUpdateTemplate);

    expect(await JobResultModel.countDocuments()).toBe(1);
  });

  test("When submitting a failed pending update template job", async () => {
    //@ts-ignore
    StorageManagementItemPlugin.mockImplementation(() => {
      return {
        auth: jest.fn(() => Promise.resolve(true)),
      };
    });

    const pendingJob = await PendingJobModel.create(
      MockPendingUpdateTemplateJob
    );
    const mockJobResultData = JSON.parse(
      JSON.stringify(MockFailedJobResultData)
    );
    mockJobResultData.jobId = pendingJob._id;

    const token = jwt.sign(
      { user: MockConstant.mockTestingUser },
      MockConstant.mockTestingSecret
    );
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        result: mockJobResultData,
      },
    });

    //@ts-ignore
    await handler(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);

    const executionPlan = await ExecutionPlanModel.findOne({}).exec();

    expect(executionPlan?.isError).toBeTruthy();
    expect(executionPlan?.isDone).toBeTruthy();
    expect(executionPlan?.updateTemplate).toStrictEqual(MockUpdateTemplate);

    expect(await JobResultModel.countDocuments()).toBe(1);
  });
});
