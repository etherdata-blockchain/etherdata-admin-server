import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { schema } from "@etherdata-blockchain/storage-model";
import { columns } from "../../internal/handlers/static_node_handler";

interface Props {
  staticNodes: schema.IStaticNode[];
}

/**
 *
 * @constructor
 */
export default function StaticNodePanel({ staticNodes }: Props) {
  return (
    <Box style={{ minHeight: "85vh", width: "100%" }}>
      <DataGrid
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
    </Box>
  );
}
