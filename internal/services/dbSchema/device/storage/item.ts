/**
 * Create a storage orm
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
import { StorageItem } from "../../../../const/common_interfaces";
import { IDevice } from "../device";

export interface IStorageItem extends Document, StorageItem {
  status: IDevice;
}

export const storageItemSchema = new Schema<IStorageItem>(
  {
    qr_code: { type: "string", unique: true },
    owner_id: { type: "string" },
  },
  { collection: "storage_management_item", toJSON: { virtuals: true } }
);

storageItemSchema.virtual("status", {
  localField: "qr_code",
  foreignField: "id",
  ref: "device",
  justOne: true,
});

/**
 *
 */
export const StorageItemModel: Model<IStorageItem> =
  mongoose.models.storage_item ??
  model<IStorageItem>("storage_item", storageItemSchema);
