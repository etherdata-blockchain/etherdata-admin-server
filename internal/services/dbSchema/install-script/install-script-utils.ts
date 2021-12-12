/**
 * Utils for installation script
 */
import {IDockerImage} from "../docker/docker-image";
import {GridColDef} from "@mui/x-data-grid";
import {JSONSchema7} from "json-schema";

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

export const jsonSchema: JSONSchema7 = {
  title: "Installation template",
  description: "Create a installation template for devices",
  properties: {
    version: {
      type: "string",
      title: "Docker Compose Version",
      description:
        "Should be one of the supported version on the website: https://docs.docker.com/compose/compose-file/compose-versioning/",
      default: "3",
    },
    template_tag: {
      type: "string",
      title: "Template tag",
      description: "Used to identify the template. Unique!",
    },
    services: {
      type: "array",
      title: "Services",
      description: "Docker compose services",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            title: "Service Name",
          },
          service: {
            type: "object",
            properties: {
              image: {
                type: "string",
                title: "Docker Image ID",
              },
              restart: {
                type: "string",
                default: "always",
              },
              environments: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              network_mode: {
                type: "string",
                enum: ["host", "bridge", "none"],
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
      },
    },
  },
};

export const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "template_tag",
    headerName: "Template Tag",
    flex: 2,
  },
  {
    field: "timestamp",
    headerName: "Created time",
    flex: 3,
  },
];

/**
 * Will add docker images info to the docker image field
 * @param{IDockerImage[]} images
 * @return{JSONSchema7}
 */
export function getSchemaWithDockerImages(images: IDockerImage[]): JSONSchema7 {
  const imageWithTags: string[] = [];
  for (const image of images) {
    for (const tag of image.tags) {
      imageWithTags.push(`${image.imageName}:${tag}`);
    }
  }
  const schema = JSON.parse(JSON.stringify(jsonSchema));
  schema.properties.services.items.properties.service.properties.image.enum =
    imageWithTags;
  return schema;
}
