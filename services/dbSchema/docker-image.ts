/**
 * Create a image object for storing required information used in generate script
 */
import mongoose, { Document, model, Schema } from "mongoose";

export interface IDockerImage extends Document {
  imageName: string;
  tags: string[];
  lastUpdate: Date;
  selectedTag: string | undefined;
  selected: boolean;
}

export const dockerImageSchema = new Schema<IDockerImage>({
  imageName: { type: "String", required: true },
  tags: ["String"],
  lastUpdate: { type: "Date", required: true },
  selected: "boolean",
  selectedTag: { type: "String", required: false },
});

export const DockerImageModel = mongoose.models.dockerImage
  ? mongoose.models.dockerImage
  : model<IDockerImage>("dockerImage", dockerImageSchema);
