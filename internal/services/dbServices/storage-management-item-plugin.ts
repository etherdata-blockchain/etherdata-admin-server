import { PaginationResult } from "../../const/common_interfaces";
import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import {
  IStorageItem,
  StorageItemModel,
} from "../dbSchema/device/storage/item";
import { Model } from "mongoose";
import { PluginName } from "../../../server/plugin/pluginName";
import { Configurations } from "../../const/configurations";

/**
 * Storage management system plugin
 */
export class StorageManagementItemPlugin extends DatabasePlugin<IStorageItem> {
  protected model: Model<IStorageItem> = StorageItemModel;
  pluginName: PluginName = "storageItem";

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
      this.model.find({ owner_id: userID }).populate("deviceStatus");
    //@ts-ignore
    return this.doPagination(query, page, Configurations.numberPerPage);
  }

  /**
   * Get device with status from database
   * @param deviceID
   */
  async getDeviceByID(deviceID: string): Promise<IStorageItem> {
    const result = this.model
      .findOne({ qr_code: deviceID })
      .populate("deviceStatus");
    return result.exec();
  }

  /**
   * Return true if device exists in the database
   * @param deviceID
   */
  async auth(deviceID: string): Promise<boolean> {
    return await this.model.exists({ qr_code: deviceID });
  }
}
