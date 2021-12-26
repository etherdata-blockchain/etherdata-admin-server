/**
 * Create a storage owner orm
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
import { StorageUser } from "../../../../const/common_interfaces";

export interface IStorageOwner extends Document, StorageUser {
  onlineCount?: number;
  totalCount?: number;
}

export const storageOwnerSchema = new Schema<IStorageOwner>(
  {
    user_id: { type: "string", index: true, unique: true },
    user_name: "string",
    coinbase: "string",
  },
  { collection: "storage_management_owner", toJSON: { virtuals: true } }
);

storageOwnerSchema.virtual("totalCount", {
  localField: "user_id",
  foreignField: "owner_id",
  ref: "storage_item",
  count: true,
});

/**
 *
 */
export const StorageOwnerModel: Model<IStorageOwner> =
  mongoose.models.storage_owner ??
  model<IStorageOwner>("storage_owner", storageOwnerSchema);
