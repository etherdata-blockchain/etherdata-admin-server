import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "../../internal/services/dbSchema/install-script/static-node-utils";
import { Box } from "@mui/material";
import { IStaticNode } from "../../internal/services/dbSchema/install-script/static-node";

interface Props {
  staticNodes: IStaticNode[];
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
