import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { schema } from "@etherdata-blockchain/storage-model";
import { columns } from "../../internal/handlers/static_node_handler";
import ResponsiveCard from "../common/ResponsiveCard";
import { StyledDataGrid } from "../common/styledDataGrid";

interface Props {
  staticNodes: schema.IStaticNode[];
}

/**
 *
 * @constructor
 */
export default function StaticNodePanel({ staticNodes }: Props) {
  return (
    <ResponsiveCard style={{ width: "100%" }}>
      <StyledDataGrid
        isRowSelectable={() => false}
        columns={columns}
        rows={staticNodes.map((d, index) => {
          return {
            id: index,
            ...d,
            details: d._id,
          };
        })}
        autoHeight
      />
    </ResponsiveCard>
  );
}
