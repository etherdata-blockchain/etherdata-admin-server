import { PaginationResult } from "../client/browserClient";
import { StorageUser } from "../plugin/plugins/storageManagementSystemPlugin";

export const DefaultPaginationResult: PaginationResult = {
  adminVersions: [],
  currentPageNumber: 0,
  devices: [],
  nodeVersions: [],
  numPerPage: 0,
  totalNumberDevices: 0,
  totalOnlineDevices: 0,
  totalPageNumber: 0,
  totalStorageNumber: 0,
};

export const DefaultStorageUser: StorageUser = {
  _id: "",
  id: undefined,
  user_id: "All",
  user_name: "All",
};
