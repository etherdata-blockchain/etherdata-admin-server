/**
 * Create a update script of device for mongoose ORM.
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
// contents of mongodb have to be completed
interface Task {
    imageName: string;
    imageTag: string;
    containerName: string;
    env: string;
}

export interface UpdateScript extends Document {
    targetDeviceId: string;
    /**
     * From client id.
     */
    from: string;
    time: Date;
    task: Task;
}

export const UpdateScriptSchema = new Schema<UpdateScript>({
    targetDeviceId: { type: String, required: true },
    time: { type: Date, required: true },
    from: { type: String, required: true },
    task: {
        imageName: { type: String, required: true },
        imageTag: { type: String, required: true },
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
