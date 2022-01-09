/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the user dbSchema for mongodb user collection
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";

/**
 * Types of job can be run
 */
export enum JobTaskType {
  /**
   * Docker task
   */
  // eslint-disable-next-line no-unused-vars
  Docker = "docker",
  /**
   * Rpc command task
   */
  // eslint-disable-next-line no-unused-vars
  Web3 = "web3",
  /**
   * Update template task
   */
  // eslint-disable-next-line no-unused-vars
  UpdateTemplate = "update-template",
}

export interface UpdateTemplateValueType {
  templateId: string;
}

export interface Web3ValueType {
  method: string;
  params: string[];
}

export interface AnyValueType {}

export type PendingJobTaskType =
  | AnyValueType
  | UpdateTemplateValueType
  | Web3ValueType;

interface Task<T extends PendingJobTaskType> {
  type: JobTaskType;
  value: T;
}

export interface IPendingJob<T> extends Document {
  targetDeviceId: string;
  /**
   * From client id.
   */
  from: string;
  task: Task<T>;
}

export const pendingJobSchema = new Schema<IPendingJob<AnyValueType>>(
  {
    targetDeviceId: { type: String, required: true },
    from: { type: String, required: true },
    task: {
      type: { type: String, required: true },
      value: { type: Schema.Types.Mixed, required: true },
    },
  },
  { timestamps: true, autoIndex: true }
);

/**
 *
 */
export const PendingJobModel: Model<IPendingJob<AnyValueType>> =
  mongoose.models.pending_job ??
  model<IPendingJob<AnyValueType>>("pending_job", pendingJobSchema);
