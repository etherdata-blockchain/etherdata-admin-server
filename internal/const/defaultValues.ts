import axios from "axios";
import jwt from "jsonwebtoken";
import { configs, interfaces } from "@etherdata-blockchain/common";
import { RealtimeStatus } from "./common_interfaces";

export const DefaultPaginationResult: interfaces.PaginationResult<interfaces.db.DeviceDBInterface> =
  {
    count: 0,
    currentPage: 0,
    pageSize: 0,
    results: [],
    totalPage: 0,
  };

export const DefaultStorageUser: interfaces.db.StorageUserDBInterface = {
  user_id: "default",
  user_name: "Default",
};

const token = () =>
  jwt.sign(
    { user: "admin" },
    configs.Environments.ClientSideEnvironments.NEXT_PUBLIC_SECRET
  );

/**
 * Axios client for admin server api
 */
export const getAxiosClient = () =>
  axios.create({
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });

/**
 * Axios client for storage management system client
 */
export const getStorageManagementAxiosClient = () =>
  axios.create({
    headers: {
      Authorization: `Bearer ${configs.Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_API_TOKEN}`,
    },
  });

export const DefaultInstallationScriptTag = {
  dockerImage: 0,
  staticNode: 1,
  installationTemplate: 2,
};

export const DefaultRealtimeStatus: RealtimeStatus = {
  pendingJobNumber: 0,
  onlineCount: 0,
  totalCount: 0,
};
