/**
 * Create a update script of device for mongoose ORM.
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
import { ContainerStack, ImageStack } from "docker-plan";

export interface IUpdateTemplate extends Document {
  name: string;
  targetDeviceIds: string[];
  targetGroupIds: string[];
  /**
   * From client id.
   */
  from: string;
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
  config: Schema.Types.Mixed,
});

export const UpdateScriptSchema = new Schema<IUpdateTemplate>(
  {
    name: { type: String, required: true },
    targetDeviceIds: { type: [String], required: true },
    targetGroupIds: { type: [String], required: true },
    from: { type: String, required: true },
    imageStacks: [{ type: ImageStackSchema }],
    containerStacks: [{ type: ContainerStackSchema, required: true }],
  },
  { timestamps: true, autoIndex: true }
);

/**
 * Schema
 */
export const UpdateScriptModel: Model<IUpdateTemplate> = mongoose.models
  .update_script
  ? mongoose.models.update_script
  : model<IUpdateTemplate>("update_script", UpdateScriptSchema);
