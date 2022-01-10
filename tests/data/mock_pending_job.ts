import { JobTaskType } from "../../internal/services/dbSchema/queue/pending-job";
import { MockDeviceID, MockDeviceID2 } from "./mock_storage_item";

export const MockPendingJob = {
  targetDeviceId: MockDeviceID,
  task: {
    type: JobTaskType.Web3,
    value: "",
  },
  from: "mock_from",
};

export const MockPendingJob2 = {
  targetDeviceId: MockDeviceID2,
  task: {
    type: JobTaskType.Web3,
    value: "",
  },
  from: "mock_from",
};
