
/**
 * Create a update script of device for mongoose ORM.
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
import { ContainerStack, ImageStack } from "docker-plan";

export interface IUpdateScript extends Document {
    targetDeviceId: string;
    /**
     * From client id.
     */
    from: string;
    time: Date;
    task: ContainerStack;
}

const ImageStackSchema = new Schema<ImageStack>({
    tag: { type: "String", required: true },
});

const ContainerStackSchema = new Schema<ContainerStack>({
    containerName: { type: "String", required: true },
    image: ImageStackSchema,
});

export const UpdateScriptSchema = new Schema<IUpdateScript>({
    targetDeviceId: { type: String, required: true },
    time: { type: Date, required: true },
    from: { type: String, required: true },
    task: {
        imageStacks: [{ type: ImageStackSchema }],
        containerStacks: [{ type: ContainerStackSchema, required: true }],
        env: { type: String, required: true },
    },
});

/**
 * Schema
 */
export const UpdateScriptModel: Model<IUpdateScript> = mongoose.models
    .update_script
    ? mongoose.models.update_script
    : model<IUpdateScript>("update_script", UpdateScriptSchema);