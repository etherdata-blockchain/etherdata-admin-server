/**
 * Create template for install script
 */
import mongoose, { Document, model, Schema } from "mongoose";
import { IDockerImage } from "../docker/docker-image";

/**
 * This template is used to generate a docker-compose file
 */
export interface IInstallationTemplate extends Document {
  version: string;
  services: { [key: string]: Service };
  /**
   * Template tag used to identify the template
   */
  // eslint-disable-next-line camelcase
  template_tag: string;
  // eslint-disable-next-line camelcase
  created_by: string;
}

interface Service {
  image: IDockerImage;
  restart: string;
  environment: string[];
  // eslint-disable-next-line camelcase
  network_mode: string;
  volumes: string[];
  labels: string[];
}

const serviceSchema = new Schema<Service>({
  image: { type: Schema.Types.ObjectId },
  restart: "String",
  environment: ["String"],
  network_mode: "String",
  volumes: ["String"],
  labels: ["String"],
});

export const installationTemplateSchema = new Schema<IInstallationTemplate>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    template_tag: { type: String, unique: true },
    services: { type: mongoose.Schema.Types.Map, of: serviceSchema },
    created_by: "string",
    version: "string",
  },
  { timestamps: true }
);

export const InstallationTemplateModel =
  mongoose.models.installationTemplate ??
  model<IInstallationTemplate>(
    "installationTemplate",
    installationTemplateSchema
  );
