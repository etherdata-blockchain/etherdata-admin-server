/**
 * Utils for installation script
 */
import React from "react";
import { IDockerImage } from "../docker/docker-image";
import { GridColDef } from "@mui/x-data-grid";
import { JSONSchema7 } from "json-schema";
import { Button } from "@mui/material";
import { Routes } from "../../../const/routes";
import DownloadTemplateButton from "../../../../components/installation/DownloadTemplateButton";
import { IInstallationTemplate } from "./install-script";

export const jsonSchema: JSONSchema7 = {
  title: "Installation template",
  description: "Create a installation template for devices",
  required: ["template_tag"],
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
        required: ["name", "service"],
        properties: {
          name: {
            type: "string",
            title: "Service Name",
          },
          service: {
            type: "object",
            properties: {
              image: {
                type: "object",
                title: "Docker Image ID",
                properties: {
                  image: { type: "string" },
                  tag: { type: "string" },
                },
              },
              restart: {
                type: "string",
                default: "always",
              },
              environment: {
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
    field: "createdAt",
    headerName: "Creation time",
    flex: 3,
  },
  {
    field: "updatedAt",
    headerName: "Updated time",
    flex: 3,
  },
  {
    field: "download",
    headerName: "Download",
    flex: 2,
    renderCell: (param) => {
      return <DownloadTemplateButton templateName={param.value} />;
    },
  },
  {
    field: "details",
    headerName: "Details",
    flex: 2,
    renderCell: (param) => {
      return (
        <Button
          onClick={() =>
            (window.location.pathname = `${Routes.installationTemplatesEdit}/${param.value}`)
          }
        >
          Details
        </Button>
      );
    },
  },
];

/**
 * Expand image with tags
 * @param{IDockerImage[]} images
 * @return{any}
 */
export function expandImages(images: IDockerImage[]): IDockerImage[] {
  const imageWithTags: any[] = [];
  for (const image of images) {
    // @ts-ignore
    if (image.tags.length === 0) {
      imageWithTags.push({ ...image, tags: [{ tag: "latest" }] });
    }
    // @ts-ignore
    for (const tag of image.tags) {
      imageWithTags.push({ ...image, tags: [tag] });
    }
  }
  return imageWithTags;
}

/**
 * convertServicesListToMap.
 * When we have a data from our json form, the services is a list.
 * However, we need services to be a map where key is the service name
 * and value is the actual script.
 *
 * **Example:**
 * ```javascript
 * {
 *     services: [
 *         {
 *             "name": "worker",
 *             "service": {
 *                 environments: []
 *             }
 *         }
 *     ]
 * }
 * ```
 * will become
 * ```javascript
 * {
 *     services: {
 *         "worker": {
 *            environments: []
 *         }
 *     }
 * }
 * ```
 * @param{any} data data from json schema form
 */
export function convertServicesListToMap(data: {
  services: { name: string; service: any }[];
}): any {
  const services: { [key: string]: any } = {};
  for (const service of data.services) {
    services[service.name] = service.service;
  }
  const copied = JSON.parse(JSON.stringify(data));
  copied.services = services;
  return copied;
}

/**
 * Convert query data from database format to format that can be used to create a data
 **Example:**
 ```javascript
 {
    services: [
        {
            "name": "worker",
            "service": {
                image: '{
                    "_id": "id",
                    imageName: "abc",
                    "tag": {"_id": "id"}
                }'
            }
        }
    ]
}
 ```
 will become
 ```javascript
 {
    services: {
        "worker": {
           environments: []
           image: {
                image: "id",
                "tags": [{"_id": "id"}],
                "tag": "_id"
           }
        }
    }
}
 ```
 * @param data
 */
export function convertQueryFormatToCreateFormat(data: IInstallationTemplate) {
  const deepCopied = JSON.parse(JSON.stringify(data));
  deepCopied.services = data.services.map((s) => {
    const image = JSON.parse(s.service.image as unknown as string);
    const tagId = typeof image.tag === "string" ? image.tag : image.tag._id;
    const imageId = typeof image.image === "string" ? image.image : image._id;

    return {
      ...s,
      service: {
        ...s.service,
        image: {
          tag: tagId,
          image: imageId,
        },
      },
    };
  });

  return deepCopied;
}
