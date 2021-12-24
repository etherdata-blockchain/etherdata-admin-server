import moment from "moment";

export const MockStorageUser = "mock_user";
export const MockDeviceID = "mock_device_id_1";
export const MockDeviceID2 = "mock_device_id_2";
export const MockDeviceName = "mock_device_name_1";
export const MockDeviceName2 = "mock_device_name_2";
export const MockAdminVersion = "1.6.0";

export const MockStorageItem = {
  column: 0,
  created_time: new Date(),
  description: "",
  images: [],
  images_objects: [],
  location_name: null,
  machine_type_name: null,
  name: "device-1",
  owner_name: {
    user_name: "test",
    user_id: MockStorageUser,
    coinbase: "a",
  },
  position_name: null,
  price: 0,
  qr_code: MockDeviceID,
  row: 0,
  uuid: "",
};

export const MockStorageItem2 = {
  column: 0,
  created_time: new Date(),
  description: "",
  images: [],
  images_objects: [],
  location_name: null,
  machine_type_name: null,
  name: "device-2",
  owner_name: {
    user_name: "test",
    user_id: MockStorageUser,
    coinbase: "a",
  },
  position_name: null,
  price: 0,
  qr_code: MockDeviceID2,
  row: 0,
  uuid: "",
};

/**
 * Online mock device
 */
export const MockDeviceStatus = {
  adminVersion: MockAdminVersion,
  data: undefined,
  docker: undefined,
  id: MockDeviceID,
  lastSeen: moment(),
  name: MockDeviceName,
  user: MockStorageUser,
};

/**
 * Offline mock device
 */
export const MockDeviceStatus2 = {
  adminVersion: MockAdminVersion,
  data: undefined,
  docker: undefined,
  id: MockDeviceID2,
  lastSeen: moment().subtract(2, "days"),
  name: MockDeviceName2,
  user: MockStorageUser,
};
