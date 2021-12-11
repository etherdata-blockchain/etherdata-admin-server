/**
 * Create template for install script
 */
import mongoose, { Document, model, Schema } from "mongoose";

export interface IInstallScript extends Document {
  version: string;
  services: { [key: string]: Service };
  selected: boolean;
}

interface Service {
  image: any;
  restart: "always";
  environment: string[];
  // eslint-disable-next-line camelcase
  network_mode: string;
  volumes: string[];
  labels: string[];
}

const serviceSchema = new Schema<Service>({
  image: { type: Schema.Types.ObjectId, ref: "dockerImage" },
  restart: "String",
  environment: { type: [String] },
  network_mode: "String",
  volumes: ["String"],
  labels: ["String"],
});

export const installScriptSchema = new Schema<IInstallScript>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    selected: "boolean",
    services: { type: mongoose.Schema.Types.Map, of: serviceSchema },
  },
  { timestamps: true }
);

export const InstallScriptModel = mongoose.models.dockerCompose
  ? mongoose.models.installScript
  : model<IInstallScript>("installScriptModel", installScriptSchema);
