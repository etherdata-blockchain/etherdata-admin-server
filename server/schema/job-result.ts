/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the device schema for mongodb device collection
 */
import { Schema, model, connect, Document, Model } from "mongoose";
import { Web3DataInfo } from "../client/node_data";
import mongoose from "mongoose";

export interface IJobResult extends Document {
  time: Date;
  deviceID: string;
  /**
   * From which client. This will be the unique id
   */
  from: string;
  command: any;
  result: any;
  success: boolean;
}

export const jobResultSchema = new Schema<IJobResult>({
  time: { type: Date, required: true },
  deviceID: { type: String, required: true },
  from: { type: String, required: true },
  command: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  success: { type: Boolean, required: true },
});

/**
 *
 */
export const JobResultModel: Model<IJobResult> = mongoose.models.job_result
  ? mongoose.models.job_result
  : model<IJobResult>("job_result", jobResultSchema);
