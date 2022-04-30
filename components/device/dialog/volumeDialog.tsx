// @flow
import * as React from "react";
import { ContainerInfo, VolumeInspectInfo } from "dockerode";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ContainerTreeView from "./containerTreeView";
import VolumeTreeView from "./volumeTreeView";

type Props = {
  show: boolean;
  onClose(): void;
  volumes: VolumeInspectInfo[];
};
/**
 * Create a dialog which display volume's info
 * @param props
 * @constructor
 */
export const VolumeDialog = ({ show, onClose, volumes }: Props) => {
  return (
    <Dialog open={show} onClose={() => onClose()} fullWidth>
      <DialogTitle>Docker volumes</DialogTitle>
      <DialogContent>
        <VolumeTreeView volumes={volumes} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>ok</Button>
      </DialogActions>
    </Dialog>
  );
};
