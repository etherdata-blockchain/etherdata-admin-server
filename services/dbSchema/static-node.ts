/**
 * Create static node object used in the installation script generation
 */
import mongoose, { Document, model, Schema } from "mongoose";

export interface IStaticNode extends Document {
  nodeName: string;
  nodeURL: string;
}

export const staticNodeSchema = new Schema<IStaticNode>({
  nodeName: { type: "String", required: true },
  nodeURL: { type: "string", required: true },
});

export const StaticNodeModel = mongoose.models.staticNode
  ? mongoose.models.staticNode
  : model<IStaticNode>("staticNode", staticNodeSchema);
