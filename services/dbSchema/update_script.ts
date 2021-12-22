/**
 * Create a update script of device for mongoose ORM.
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";

interface ImageStack {
    image: string;
    tag: string;
}

interface ContainerStack {
    containerName: string;
    image: ImageStack;
    env: string;
}

export interface UpdateScript extends Document {
    targetDeviceId: string;
    /**
     * From client id.
     */
    from: string;
    time: Date;
    task: ContainerStack;
}

export const UpdateScriptSchema = new Schema<UpdateScript>({
    targetDeviceId: { type: String, required: true },
    time: { type: Date, required: true },
    from: { type: String, required: true },
    task: {
        image: { type: Schema.Types.Mixed, required: true },
        containerName: { type: String, required: true },
        env: { type: String, required: true },
    },
});

/**
 *
 */
export const UpdateScriptModel: Model<UpdateScript> = mongoose.models.update_script
    ? mongoose.models.update_script
    : model<UpdateScript>("update_script", UpdateScriptSchema);
