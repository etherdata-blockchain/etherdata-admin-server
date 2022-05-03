import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { schema } from "@etherdata-blockchain/storage-model";
import { columns } from "../../internal/handlers/update_template_handler";

interface Props {
  updateTemplates: schema.IUpdateTemplate[];
}

/**
 *
 * @constructor
 */
export default function UpdateTemplatePanel({ updateTemplates }: Props) {
  return (
    <Box style={{ width: "100%" }}>
      <DataGrid
        isRowSelectable={() => false}
        columns={columns}
        rows={updateTemplates.map((d, index) => {
          return { id: index, ...d, details: d._id, run: d._id };
        })}
        autoHeight
      />
    </Box>
  );
}
