import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { JSONSchema7 } from "json-schema";
import { Button } from "@mui/material";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

export const jsonSchema: JSONSchema7 = {
  title: "Docker Image",
  required: ["imageName", "tags"],
  properties: {
    imageName: {
      title: "Image Name",
      description:
        "Docker Image Name should includes repo name. For example sirily11/getd",
      type: "string",
    },
    tags: {
      title: "Image tags",
      type: "array",
      items: {
        type: "object",
        properties: {
          tag: {
            title: "Tag",
            type: "string",
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
    field: "imageName",
    headerName: "Image",
    flex: 4,
  },
  {
    field: "tags",
    headerName: "Tags",
    flex: 4,
  },

  {
    field: "details",
    headerName: "Details",
    flex: 2,
    renderCell: (param) => {
      return (
        <Button
          onClick={() =>
            (window.location.pathname = `${Routes.dockerImageEdit}/${param.value}`)
          }
        >
          Details
        </Button>
      );
    },
  },
];
