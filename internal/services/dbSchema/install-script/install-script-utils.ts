/**
 * Utils for installation script
 */
import { IDockerImage } from "../docker/docker-image";
import { GridColDef } from "@mui/x-data-grid";
import { JSONSchema7 } from "json-schema";
import { IInstallationTemplate } from "./install-script";

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

/**
 * Postprocess data.
 * When we have a data from our json form, the services is a list.
 * However, we need services to be a map where key is the service name
 * and value is the actual script.
 * @param{any} data data from json schema form
 */
export function postprocessData(data: {
  services: { title: string; service: any }[];
}): IInstallationTemplate {
  const services: { [key: string]: any } = {};
  for (const service of data.services) {
    services[service.title] = service.service;
  }
  const copied = JSON.parse(JSON.stringify(data));
  copied.services = services;
  return copied;
}

/**
 * Preprocess Data
 * When we provide a data for our database, then
 * we want to convert the format to the format we used in our json schema form.
 * Since our database use map to represent the services attribute,
 * and our json schema used list to represent the services attribute.
 * @param{any} data Data from database
 * @return{any} data will be used in json schema form
 */
export function preprocessData(data: IInstallationTemplate): any {
  const services: any[] = [];
  for (const [key, value] of Object.entries(data.services)) {
    services.push({ title: key, service: value });
  }
  const copied = JSON.parse(JSON.stringify(data));
  copied.services = services;
  return copied;
}
