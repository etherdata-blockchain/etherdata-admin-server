/**
 * Create a update script of device for mongoose ORM.
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
import { ContainerStack, ImageStack } from "docker-plan";

export interface IUpdateScript extends Document {
  targetDeviceId?: string;
  targetGroupId?: string;
  /**
   * From client id.
   */
  from: string;
  time: Date;
  imageStacks: ImageStack[];
  containerStacks: ContainerStack[];
}

const ImageStackSchema = new Schema({
  tag: { type: Schema.Types.ObjectId, required: true },
  image: { type: Schema.Types.ObjectId, required: true },
});

const ContainerStackSchema = new Schema<ContainerStack>({
  containerName: { type: "String", required: true },
  image: ImageStackSchema,
});

export const UpdateScriptSchema = new Schema<IUpdateScript>({
  targetDeviceId: { type: String, required: false },
  targetGroupId: { type: String, required: false },
  time: { type: Date, required: true },
  from: { type: String, required: true },
  imageStacks: [{ type: ImageStackSchema }],
  containerStacks: [{ type: ContainerStackSchema, required: true }],
});

/**
 * Schema
 */
export const UpdateScriptModel: Model<IUpdateScript> = mongoose.models
  .update_script
  ? mongoose.models.update_script
  : model<IUpdateScript>("update_script", UpdateScriptSchema);
