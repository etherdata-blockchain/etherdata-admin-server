import { PaginationResult } from "../client/browserClient";
import { StorageUser } from "../../services/dbServices/storageManagementSystemPlugin";

export const DefaultPaginationResult: PaginationResult = {
  adminVersions: [],
  devices: [],
  nodeVersions: [],
  totalNumberDevices: 0,
  totalOnlineDevices: 0,
  totalStorageNumber: 0,
};

export const DefaultStorageUser: StorageUser = {
  _id: "default",
  id: "default",
  user_id: "default",
  user_name: "Default",
};
