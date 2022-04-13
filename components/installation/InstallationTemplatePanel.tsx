import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { schema } from "@etherdata-blockchain/storage-model";
import { columns } from "../../internal/handlers/install_script_handler";
import { StyledDataGrid } from "../common/styledDataGrid";
import ResponsiveCard from "../common/ResponsiveCard";

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
    <ResponsiveCard style={{ width: "100%" }}>
      <StyledDataGrid
        isRowSelectable={() => false}
        columns={columns}
        rows={installationTemplates.map((d, index) => {
          return { id: index, ...d, details: d._id, download: d.template_tag };
        })}
        autoHeight
      />
    </ResponsiveCard>
  );
}
