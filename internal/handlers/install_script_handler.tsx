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
