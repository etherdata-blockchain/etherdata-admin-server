import React from "react";
<<<<<<< HEAD
import { IDockerImage } from "../../services/dbSchema/docker-image";
import ResponsiveCard from "../ResponsiveCard";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "../../services/dbSchema/docker-image-utils";
import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import Form from "@rjsf/bootstrap-4";
import axios from "axios";
import { getSchemaWithImage } from "../../services/dbSchema/docker-compose-schema";
=======
import {IDockerImage} from "../../internal/services/dbSchema/docker/docker-image";
import {DataGrid} from "@mui/x-data-grid";
import {columns} from "../../internal/services/dbSchema/docker/docker-image-utils";
import {Box} from "@mui/material";
// import Form from "@rjsf/bootstrap-4";
// import axios from "axios";
>>>>>>> upstream/install-script

interface Props {
  dockerImages: IDockerImage[];
}

/**
 *
 * @constructor
 */
export default function DockerImagesPanel({ dockerImages }: Props) {
<<<<<<< HEAD
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
              const url = "api/v1/installation/docker-image";
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
=======
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
          };
        })}
        autoHeight
      />
    </Box>
>>>>>>> upstream/install-script
  );
}
