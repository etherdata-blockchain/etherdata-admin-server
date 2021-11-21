/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the user schema for mongodb user collection
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";

export interface IJobResult extends Document {
  jobId: string;
  time: Date;
  deviceID: string;
  /**
   * From which client. This will be the unique id
   */
  from: string;
  command: any;
  result: any;
  success: boolean;
  commandType: string;
}

export const jobResultSchema = new Schema<IJobResult>({
  jobId: { type: String, required: true },
  time: { type: Date, required: true },
  deviceID: { type: String, required: true },
  from: { type: String, required: true },
  command: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  success: { type: Boolean, required: true },
  commandType: { type: String, required: false },
});

/**
 *
 */
export const JobResultModel: Model<IJobResult> = mongoose.models.job_result
  ? mongoose.models.job_result
  : model<IJobResult>("job_result", jobResultSchema);
