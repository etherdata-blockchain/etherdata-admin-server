// @flow
import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ImageTreeView from "./imageTreeView";
import { ImageInfo } from "dockerode";

type Props = {
  images: ImageInfo[];
  show: boolean;
  onClose(): void;
};

export const ImageDialog = ({ show, images, onClose }: Props) => {
  return (
    <Dialog open={show} onClose={() => onClose()} fullWidth>
      <DialogTitle>Docker Images</DialogTitle>
      <DialogContent>
        <ImageTreeView images={images} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>ok</Button>
      </DialogActions>
    </Dialog>
  );
};
