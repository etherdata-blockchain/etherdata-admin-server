import axios from "axios";
import jwt from "jsonwebtoken";
import { Environments } from "./environments";
import { PaginationResult, StorageUser } from "./common_interfaces";
import { IDevice } from "../services/dbSchema/device/device";

export const DefaultPaginationResult: PaginationResult<IDevice> = {
  count: 0,
  currentPage: 0,
  pageSize: 0,
  results: [],
  totalPage: 0,
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
