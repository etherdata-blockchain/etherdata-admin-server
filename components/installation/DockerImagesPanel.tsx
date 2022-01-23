import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { schema } from "@etherdata-blockchain/storage-model";
import { columns } from "../../internal/handlers/docker_image_handler";

interface Props {
  dockerImages: schema.IDockerImage[];
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
