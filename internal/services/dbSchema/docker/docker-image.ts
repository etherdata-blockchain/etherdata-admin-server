/**
 * Create a image object for storing required information used in generate script
 */
import mongoose, { Document, model, Schema } from "mongoose";

export interface IDockerImage extends Document {
  imageName: string;
  tags: IDOckerImageVersion[];
}

interface IDOckerImageVersion extends Document {
  tag: string;
}

export const versionSchema = new Schema<IDOckerImageVersion>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
  tag: "String",
});

export const dockerImageSchema = new Schema<IDockerImage>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    imageName: { type: "String", required: true },
    tags: [versionSchema],
  },
  {
    timestamps: true,
  }
);

export const DockerImageModel =
  mongoose.models.dockerImage ??
  model<IDockerImage>("dockerImage", dockerImageSchema);
