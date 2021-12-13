import { PaginationResult } from "../../server/client/browserClient";
import { StorageUser } from "../services/dbServices/storage-management-system-plugin";
import axios from "axios";
import jwt from "jsonwebtoken";

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

const token = () =>
  jwt.sign(
    { user: "admin" },
    process.env.PUBLIC_SECRET ?? process.env.NEXT_PUBLIC_SECRET!
  );

export const getAxiosClient = () =>
  axios.create({
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });

export const DefaultInstallationScriptTag = {
  dockerImage: 0,
  staticNode: 1,
  installationTemplate: 2,
};
