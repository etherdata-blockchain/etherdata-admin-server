import { PaginationResult } from "../../const/common_interfaces";
import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { Model } from "mongoose";
import { PluginName } from "../../../server/plugin/pluginName";
import {
  IStorageOwner,
  StorageOwnerModel,
} from "../dbSchema/device/storage/owner";
import { Configurations } from "../../const/configurations";
import moment from "moment";

/**
 * Storage management system plugin
 */
export class StorageManagementOwnerPlugin extends DatabasePlugin<IStorageOwner> {
  protected model: Model<IStorageOwner> = StorageOwnerModel;
  pluginName: PluginName = "storageOwner";

  /**
   * Get list of users with number of online devices count and total devices count
   * @param{number} page Current page
   */
  async getListOfUsers(page: number): Promise<PaginationResult<IStorageOwner>> {
    const now = moment();
    const prev = now.subtract(Configurations.maximumNotSeenDuration);
    const pipeline: any[] = [
      {
        $lookup: {
          from: "storage_management_item",
          localField: "user_id",
          foreignField: "owner_id",
          as: "devices",
        },
      },
      {
        $addFields: {
          totalCount: {
            $size: "$devices",
          },
        },
      },
      {
        $unwind: {
          path: "$devices",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "devices",
          localField: "devices.qr_code",
          foreignField: "id",
          as: "status",
        },
      },
      {
        $unwind: {
          path: "$status",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          count: {
            $cond: {
              if: {
                $gt: ["$status.lastSeen", prev.toDate()],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          onlineCount: {
            $sum: "$count",
          },
          user_name: {
            $first: "$user_name",
          },
          user_id: {
            $first: "$user_id",
          },
          coinbase: {
            $first: "$coinbase",
          },
          totalCount: {
            $first: "$totalCount",
          },
        },
      },
    ];

    const aggregation = () => this.model.aggregate(pipeline);
    const query: any = () => this.model.find();

    return this.doPaginationForAgg(
      aggregation,
      query,
      page,
      Configurations.numberPerPage
    );
  }
}
