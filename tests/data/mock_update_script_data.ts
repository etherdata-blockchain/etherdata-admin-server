import { MockUser } from "./mock_storage_item";

const MockContainerName = "mock_container_name";
const MockContainerName2 = "mock_container_name_2";

const MockTargetDeviceId = "mock_target_device_id";
const MockTargetGroupId = "mock_target_group_id";

export const MockUpdateScriptData = {
  name: "Mock_template_1",
  targetDeviceIds: [MockTargetDeviceId],
  targetGroupIds: [MockTargetGroupId],
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

/**
 * With multiple images
 */
export const MockUpdateScriptData2 = {
  name: "Mock_template_2",
  targetDeviceId: MockTargetDeviceId,
  targetGroupId: MockTargetGroupId,
  from: MockUser.user_id,
  time: new Date(),
  imageStacks: [
    {
      tag: "",
    },
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
    {
      containerName: MockContainerName2,
      image: {
        tag: "",
      },
    },
  ],
};
