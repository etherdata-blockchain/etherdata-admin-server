import { PaginationResult } from "../../server/client/browserClient";
import axios from "axios";
import jwt from "jsonwebtoken";
import { Environments } from "./environments";
import { StorageUser } from "./common_interfaces";

export const DefaultPaginationResult: PaginationResult = {
  adminVersions: [],
  devices: [],
  nodeVersions: [],
  totalNumberDevices: 0,
  totalOnlineDevices: 0,
  totalStorageNumber: 0,
};

export const DefaultStorageUser: StorageUser = {
  user_id: "default",
  user_name: "Default",
};

const token = () =>
  jwt.sign(
    { user: "admin" },
    Environments.ClientSideEnvironments.NEXT_PUBLIC_SECRET
  );

export const getAxiosClient = () =>
  axios.create({
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });

export const getStorageManagementAxiosClient = () =>
  axios.create({
    headers: {
      Authorization: `Bearer ${Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_API_TOKEN}`,
    },
  });

export const DefaultInstallationScriptTag = {
  dockerImage: 0,
  staticNode: 1,
  installationTemplate: 2,
};
