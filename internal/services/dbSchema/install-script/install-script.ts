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
  services: { name: string; service: Service }[];
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

const serviceSchema = new Schema<{ name: string; service: Service }>({
  name: String,
  service: {
    image: {
      image: { type: Schema.Types.ObjectId, required: true },
      tag: { type: Schema.Types.ObjectId, required: true },
    },
    restart: "String",
    environment: ["String"],
    network_mode: "String",
    volumes: ["String"],
    labels: ["String"],
  },
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
    services: [serviceSchema],
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
