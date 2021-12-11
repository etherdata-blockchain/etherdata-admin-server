import React from "react";
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import ResponsiveCard from "../ResponsiveCard";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "../../internal/services/dbSchema/docker/docker-image-utils";
import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import Form from "@rjsf/bootstrap-4";
import axios from "axios";
import { getSchemaWithImage } from "../../internal/services/installScript/docker-compose-schema";

interface Props {
  dockerImages: IDockerImage[];
}

/**
 *
 * @constructor
 */
export default function DockerImagesPanel({ dockerImages }: Props) {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <ResponsiveCard style={{ minHeight: "85vh", width: "100%" }}>
      <Box display={"flex"} justifyContent={"flex-end"}>
        <Button onClick={() => setShowDialog(true)}>Add Image</Button>
      </Box>
      <DataGrid
        columns={columns}
        rows={dockerImages.map((d, index) => {
          return { id: index, ...d };
        })}
        autoHeight
      />
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} fullWidth>
        <DialogTitle>Add Docker Image</DialogTitle>
        <DialogContent>
          <Form
            schema={getSchemaWithImage(dockerImages)}
            onSubmit={async (data) => {
              const url = "api/v1/installation-template/docker-image";
              try {
                //TODO: Add auto generated _id
                await axios.post(url, data.formData, {
                  headers: {
                    authorization: process.env.NEXT_PUBLIC_CLIENT_PASSWORD,
                  },
                });
                setShowDialog(false);
              } catch (e) {
                alert(e);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </ResponsiveCard>
  );
}
