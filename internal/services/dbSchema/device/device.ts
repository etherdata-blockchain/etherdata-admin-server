/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the user dbSchema for mongodb user collection
 */
import mongoose, { Document, model, Schema } from "mongoose";
import { Web3DataInfo } from "../../../../server/client/node_data";
import { ContainerInfo, ImageInfo } from "dockerode";
import moment from "moment";
import { Configurations } from "../../../const/configurations";

interface Docker {
  images: ImageInfo[];
  containers: ContainerInfo[];
}

export interface IDevice extends Document {
  lastSeen?: Date;
  id: string;
  name: string;
  user: string | null;
  adminVersion: string;
  data?: Web3DataInfo;
  docker?: Docker;
}

export const deviceSchema = new Schema<IDevice>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  user: { type: String, required: false },
  lastSeen: { type: Date, required: false },
  data: { type: Object, required: false },
  adminVersion: { type: String, required: true },
  docker: { type: Object, required: false },
});

deviceSchema.virtual("isOnline").get(function () {
  // @ts-ignore
  if (!this.lastSeen) {
    return false;
  }

  const now = moment();
  // @ts-ignore
  const lastSeen = moment(this.lastSeen);
  return Math.abs(now.diff(lastSeen)) < Configurations.maximumNotSeenDuration;
});

/**
 * A user model. Mongoose will use this model to do CRUD operations.
 */
export const DeviceModel =
  mongoose.models.device ?? model<IDevice>("device", deviceSchema);
