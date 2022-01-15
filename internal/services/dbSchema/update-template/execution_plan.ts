/**
 * Create a update script of device for mongoose ORM.
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";

export interface IExecutionPlan extends Document {
  createdAt: any;
  updateTemplate: any;
  isDone: boolean;
  isError: boolean;
  name: string;
  description: string;
}

export const ExecutionPlanSchema = new Schema<IExecutionPlan>(
  {
    updateTemplate: { type: mongoose.Types.ObjectId, ref: "update_script" },
    isDone: "boolean",
    isError: "boolean",
    name: "string",
    description: "string",
  },
  { timestamps: true, autoIndex: true }
);

/**
 * Schema
 */
export const ExecutionPlanModel: Model<IExecutionPlan> = mongoose.models
  .execution_plan
  ? mongoose.models.execution_plan
  : model<IExecutionPlan>("execution_plan", ExecutionPlanSchema);
