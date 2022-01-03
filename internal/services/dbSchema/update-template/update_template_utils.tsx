import { JSONSchema7 } from "json-schema";
import { GridColDef } from "@mui/x-data-grid";
import React from "react";
import { IUpdateTemplate } from "./update_template";
import { Button } from "@mui/material";
import { Routes } from "../../../const/routes";

export const jsonSchema: JSONSchema7 = {
  description:
    "Update template is a declarative syntax of update template. It will be sent to every devices" +
    "in the group. Each device will follow the update template's instruction to pull, create, remove, or delete" +
    "the images or containers.",
  properties: {
    name: {
      type: "string",
      description: "Template's name",
    },
    targetDeviceIds: {
      title: "Target Devices' id",
      type: "string",
    },
    from: {
      type: "string",
      default: "admin",
    },
    imageStacks: {
      title: "Docker Images",
      description: "Will use this field to pull images from remote",
      type: "array",
      items: {
        title: "Docker Image",
        type: "string",
      },
    },
    containerStacks: {
      title: "Docker Container",
      description: "Will use this field to create containers",
      type: "array",
      items: {
        type: "object",
        properties: {
          containerName: {
            type: "string",
            title: "Container Name",
          },
          image: {
            type: "string",
            description: "Which image will be used",
          },
          config: {
            title: "Container Configurations",
            type: "object",
            properties: {
              HostName: { type: "string" },
              Domainname: { type: "string" },
              User: { type: "string" },
              AttachStdin: { type: "boolean" },
              AttachStdout: { type: "boolean" },
              AttachStderr: { type: "boolean" },
              Tty: { type: "string" },
              OpenStdin: { type: "boolean" },
              StdinOnce: { type: "boolean" },
              Env: { type: "array", items: { type: "string" } },
              Cmd: { type: "array", items: { type: "string" } },
              Entrypoint: { type: "string" },
              Labels: { type: "array", items: { type: "string" } },
              Volumes: {
                type: "array",
                items: {
                  type: "object",
                  required: ["from", "to"],
                  properties: {
                    from: {
                      type: "string",
                    },
                    to: {
                      type: "string",
                    },
                  },
                },
              },
              WorkingDir: { type: "string" },
              NetworkDisabled: { type: "string" },
              MacAddress: { type: "string" },
              ExposedPorts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                  },
                },
              },
              StopSignal: { type: "string" },
              StopTimeout: { type: "number" },
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
  },
  {
    field: "name",
    headerName: "Name",
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
    field: "details",
    headerName: "Details",
    flex: 2,
    renderCell: (param) => {
      return (
        <Button
          onClick={() =>
            (window.location.pathname = `${Routes.updateTemplateEdit}/${param.value}`)
          }
        >
          Details
        </Button>
      );
    },
  },
];

/**
 * Convert a {from, to} array to {from: to} Map based on targetKeys
 * @param data
 * @param targetKeys
 */
export function convertFromToArrayToMap(
  data: { [key: string]: any },
  targetKeys: string[]
) {
  const deepCopied: { [key: string]: any } = JSON.parse(JSON.stringify(data));

  for (const [key, value] of Object.entries(deepCopied)) {
    if (targetKeys.includes(key)) {
      const newMap: { [key: string]: any } = {};
      for (const item of value) {
        newMap[item.from] = item.to;
      }
      deepCopied[key] = newMap;
      continue;
    }

    if (typeof value === "object") {
      convertFromToArrayToMap(deepCopied, targetKeys);
    }
  }
  return deepCopied;
}

/**
 *
 * @param data
 */
export function convertQueryFormatToCreateFormat(data: IUpdateTemplate) {
  const deepCopied: IUpdateTemplate = JSON.parse(JSON.stringify(data));
  deepCopied.targetDeviceIds = JSON.parse(
    data.targetDeviceIds as unknown as string
  );
  return deepCopied;
}
