import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { schema } from "@etherdata-blockchain/storage-model";
import { columns } from "../../internal/handlers/install_script_handler";

interface Props {
  installationTemplates: schema.IInstallationTemplate[];
}

/**
 *
 * @constructor
 */
export default function InstallationTemplatePanel({
  installationTemplates,
}: Props) {
  return (
    <Box style={{ minHeight: "85vh", width: "100%" }}>
      <DataGrid
        isRowSelectable={() => false}
        columns={columns}
        rows={installationTemplates.map((d, index) => {
          return { id: index, ...d, details: d._id, download: d.template_tag };
        })}
        autoHeight
      />
    </Box>
  );
}
