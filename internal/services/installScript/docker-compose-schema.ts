import { JSONSchema7 } from "json-schema";
import { IDockerImage } from "../dbSchema/docker/docker-image";

const dockerComposeSchema: JSONSchema7 = {
  title: "Docker Compose File",
  type: "object",
  required: ["version", "services"],
  properties: {
    version: {
      type: "string",
      title: "Version",
    },
    selected: {
      type: "boolean",
      title: "Selected",
    },
    services: {
      type: "object",
      title: "Services",
      properties: {
        image: {
          type: "string",
          title: "Image",
        },
        restart: {
          type: "string",
          title: "Restart",
          enum: ["no", "always", "on-failure", "unless-stopped"],
        },
        environment: {
          type: "array",
          items: {
            type: "string",
          },
        },
        network_mode: {
          type: "string",
          title: "Network mode",
          enum: ["bridge", "host", "none"],
        },
        volumes: {
          type: "array",
          items: {
            type: "string",
          },
        },
        labels: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
  },
};

/**
 * Get schema with image versions
 * @param images
 */
export function getSchemaWithImage(images: IDockerImage[]) {
  const imageNames = images.map(
    (i) => `${i.imageName}:${i.selectedTag ?? "latest"}`
  );

  const newSchema = JSON.parse(JSON.stringify(dockerComposeSchema));
  newSchema.properties.services.properties.image.enum = imageNames;
  return newSchema;
}
