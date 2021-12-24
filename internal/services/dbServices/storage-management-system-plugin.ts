import {
  DefaultStorageUser,
  getStorageManagementAxiosClient,
} from "../../const/defaultValues";
import qs from "query-string";
import { Environments } from "../../const/environments";
import {
  PaginationResult,
  StorageItem,
  StorageUser,
} from "../../const/common_interfaces";
import join from "url-join";
import { Routes } from "../../const/routes";
import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { IStorageItem, StorageItemModel } from "../dbSchema/storage/item";
import { Model } from "mongoose";
import { PluginName } from "../../../server/plugin/pluginName";
import { Configurations } from "../../const/configurations";

/**
 * Storage management system plugin
 */
export class StorageManagementSystemPlugin extends DatabasePlugin<IStorageItem> {
  protected model: Model<IStorageItem> = StorageItemModel;
  pluginName: PluginName = "storageItem";

  /**
   * Get list of users
   * @param{number} page start from 1
   */
  async getUsers(page: number): Promise<PaginationResult<StorageUser>> {
    const query = {
      page: page,
    };
    const response = await getStorageManagementAxiosClient().get(
      qs.stringifyUrl({
        url: join(
          Environments.ServerSideEnvironments.STORAGE_MANAGEMENT_URL,
          Routes.owner
        ),
        query,
      })
    );

    const users: PaginationResult<StorageUser> = response.data;

    if (page === 1) users.results.push(DefaultStorageUser);

    return users;
  }

  /**
   * Get devices by user ID
   * @param{number} page current page number start from 1
   * @param{string} userID user's pk
   */
  async getDevicesByUser(
    page: number,
    userID?: string
  ): Promise<PaginationResult<IStorageItem>> {
    const query = () =>
      this.model.find({ "owner_name.user_id": userID }).populate("status");
    //@ts-ignore
    return this.doPagination(query, page, Configurations.numberPerPage);
  }
}
