/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the user dbSchema for mongodb user collection
 */
import mongoose, { Document, model, Model, Schema } from "mongoose";
// contents of mongodb have to be completed
interface Task {
    /**
     * To be changed
     */
    type: string;
    value: any;
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
        type: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
    },
});

/**
 *
 */
export const UpdateScriptModel: Model<UpdateScript> = mongoose.models.pending_job
    ? mongoose.models.pending_job
    : model<UpdateScript>("update_script", UpdateScriptSchema);
