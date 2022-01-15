import moment from "moment";
import { StorageUser } from "../../internal/const/common_interfaces";
import { Configurations } from "../../internal/const/configurations";

export const MockStorageUserId = "mock_user";
export const MockStorageUserId2 = "mock_user_2";
export const MockDeviceID = "mock_device_id_1";
export const MockDeviceID2 = "mock_device_id_2";
export const MockDeviceID3 = "mock_device_id_3";
export const MockDeviceName = "mock_device_name_1";
export const MockDeviceName2 = "mock_device_name_2";
export const MockAdminVersion = "1.6.0";

export const MockUser: StorageUser = {
  user_name: "test",
  user_id: MockStorageUserId,
  coinbase: "a",
};

export const MockUser2: StorageUser = {
  user_name: "test_2",
  user_id: MockStorageUserId2,
  coinbase: "b",
};

export const MockStorageItem = {
  column: 0,
  created_time: new Date(),
  description: "",
  images: [],
  images_objects: [],
  location_name: null,
  machine_type_name: null,
  name: "device-1",
  owner_id: MockStorageUserId,
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
  name: "device-2",
  owner_id: MockStorageUserId,
  price: 0,
  qr_code: MockDeviceID2,
  row: 0,
  uuid: "",
};

export const MockStorageItem3 = {
  column: 0,
  created_time: new Date(),
  description: "",
  images: [],
  images_objects: [],
  name: "device-3",
  owner_id: MockStorageUserId2,
  price: 0,
  qr_code: MockDeviceID3,
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
  user: MockStorageUserId,
};

/**
 * Offline mock device
 */
export const MockDeviceStatus2 = {
  adminVersion: MockAdminVersion,
  data: undefined,
  docker: undefined,
  id: MockDeviceID2,
  lastSeen: moment().subtract(
    Configurations.maximumNotSeenDuration * 2,
    "seconds"
  ),
  name: MockDeviceName2,
  user: MockStorageUserId,
};
