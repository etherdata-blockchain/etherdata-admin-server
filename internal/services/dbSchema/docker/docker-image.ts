/**
 * Create a image object for storing required information used in generate script
 */
import mongoose, { Document, Model, model, Schema } from "mongoose";

export interface IDockerImage extends Document {
  imageName: string;
  tags: IDOckerImageVersion[];
  /**
   * Will be set when query from installation template
   */
  tag?: IDOckerImageVersion;
}

interface IDOckerImageVersion extends Document {
  tag: string;
}

export const dockerImageSchema = new Schema<IDockerImage>(
  {
    imageName: { type: "String", required: true },
    tags: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          required: true,
          auto: true,
        },
        tag: "String",
      },
    ],
  },
  {
    timestamps: true,
  }
);

dockerImageSchema.index({ imageName: "text" });

export const DockerImageModel: Model<IDockerImage> =
  mongoose.models.dockerImage ??
  model<IDockerImage>("dockerImage", dockerImageSchema);
