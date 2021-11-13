/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the device schema for mongodb device collection
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";

interface Task {
  type: string;
  value: any;
}

export interface IPendingJob extends Document {
  targetDeviceId: string;
  /**
   * From client id.
   */
  from: string;
  time: Date;
  task: Task;
}

export const pendingJobSchema = new Schema<IPendingJob>({
  targetDeviceId: { type: String, required: true },
  time: { type: Date, required: true },
  from: { type: String, required: true },
  task: {
    type: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
});

/**
 *
 */
export const PendingJobModel: Model<IPendingJob> = mongoose.models.pending_job
  ? mongoose.models.pending_job
  : model<IPendingJob>("pending_job", pendingJobSchema);
