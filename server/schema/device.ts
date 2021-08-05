/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the devices schema for mongodb device collection
 */
import { Schema, model, connect, Document } from "mongoose";

export interface IDevice extends Document {
  /**
   * Device name
   */
  name: string;
  /**
   * Device ID
   */
  id: string;
  /**
   * User ID
   */
  user: string;
  /**
   * Device status. True means online.
   */
  online: boolean;
}

const deviceSchema = new Schema<IDevice>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  user: { type: String, required: false },
  online: Boolean,
});

/**
 * A device model. Mongoose will use this model to do CRUD operations.
 */
export const DeviceModel = model<IDevice>("device", deviceSchema);
