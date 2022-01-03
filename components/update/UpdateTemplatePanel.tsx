import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "../../internal/services/dbSchema/update-template/update_template_utils";
import { Box } from "@mui/material";
import { IUpdateTemplate } from "../../internal/services/dbSchema/update-template/update_template";

interface Props {
  updateTemplates: IUpdateTemplate[];
}

/**
 *
 * @constructor
 */
export default function UpdateTemplatePanel({ updateTemplates }: Props) {
  return (
    <Box style={{ minHeight: "85vh", width: "100%" }}>
      <DataGrid
        isRowSelectable={() => false}
        columns={columns}
        rows={updateTemplates.map((d, index) => {
          return { id: index, ...d, details: d._id };
        })}
        autoHeight
      />
    </Box>
  );
}
