import React from "react";
<<<<<<< HEAD
import {DataGrid} from "@mui/x-data-grid";
import {columns} from "../../internal/services/dbSchema/install-script/install-script-utils";
import {IInstallationTemplate} from "../../internal/services/dbSchema/install-script/install-script";
import {Box} from "@mui/material";
=======
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "../../internal/services/dbSchema/install-script/install-script-utils";
import { IInstallationTemplate } from "../../internal/services/dbSchema/install-script/install-script";
import { Box } from "@mui/material";
>>>>>>> upstream/dev
// import Form from "@rjsf/bootstrap-4";
// import axios from "axios";

interface Props {
  installationTemplates: IInstallationTemplate[];
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
<<<<<<< HEAD
        columns={columns}
        rows={installationTemplates.map((d, index) => {
          return { id: index, ...d };
=======
        isRowSelectable={() => false}
        columns={columns}
        rows={installationTemplates.map((d, index) => {
          return { id: index, ...d, details: d._id, download: d.template_tag };
>>>>>>> upstream/dev
        })}
        autoHeight
      />
    </Box>
  );
}
