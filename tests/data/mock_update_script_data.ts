import { MockUser } from "./mock_storage_item";

const MockContainerName = "mock_container_name";
const MockTargetDeviceId = "mock_target_device_id";
const MockTargetGroupId = "mock_target_group_id";

export const MockUpdateScriptData = {
  targetDeviceId: MockTargetDeviceId,
  targetGroupId: MockTargetGroupId,
  from: MockUser.user_id,
  time: new Date(),
  imageStacks: [
    {
      tag: "",
    },
  ],
  containerStacks: [
    {
      containerName: MockContainerName,
      image: {
        tag: "",
      },
    },
  ],
};
