/**
 * Utils for installation script
 */
import { GridColDef } from "@mui/x-data-grid";
import { JSONSchema7 } from "json-schema";
import { Button } from "@mui/material";
import React from "react";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

export const jsonSchema: JSONSchema7 = {
  title: "Static Node",
  description:
    "Create a list of static nodes. This will be useful when a new node is added to the network and cannot find any peer",
  properties: {
    nodeName: { type: "string", title: "Name", description: "Unique name" },
    nodeURL: { type: "string", title: "Enode URL" },
  },
};

export const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "nodeName",
    headerName: "Node Name",
    flex: 2,
  },
  {
    field: "nodeURL",
    headerName: "Node Name",
    flex: 5,
  },
  {
    field: "details",
    headerName: "Details",
    flex: 2,
    renderCell: (param) => {
      return (
        <Button
          onClick={() =>
            (window.location.pathname = `${Routes.staticNodeEdit}/${param.value}`)
          }
        >
          Details
        </Button>
      );
    },
  },
];
