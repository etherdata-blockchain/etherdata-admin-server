import React from "react";
import {IDockerImage} from "../../internal/services/dbSchema/docker/docker-image";
import {DataGrid} from "@mui/x-data-grid";
import {columns} from "../../internal/services/dbSchema/docker/docker-image-utils";
import {Box} from "@mui/material";
// import Form from "@rjsf/bootstrap-4";
// import axios from "axios";

interface Props {
  dockerImages: IDockerImage[];
}

/**
 *
 * @constructor
 */
export default function DockerImagesPanel({ dockerImages }: Props) {
  return (
    <Box style={{ minHeight: "85vh", width: "100%" }}>
      <DataGrid
        isRowSelectable={() => false}
        columns={columns}
        rows={dockerImages.map((d, index) => {
          return {
            id: index,
            ...d,
            details: d._id,
            tags: d.tags.map((t) => t.tag),
          };
        })}
        autoHeight
      />
    </Box>
  );
}
