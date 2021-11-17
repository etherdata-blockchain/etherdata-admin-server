// @flow
import * as React from "react";
import { ContainerInfo } from "dockerode";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ContainerTreeView from "./containerTreeView";

type Props = {
  show: boolean;
  onClose(): void;
  containers: ContainerInfo[];
};
/**
 * Create a dialog which display container's info
 * @param props
 * @constructor
 */
export const ContainerDialog = ({ show, onClose, containers }: Props) => {
  return (
    <Dialog open={show} onClose={() => onClose()} fullWidth>
      <DialogTitle>Docker containers</DialogTitle>
      <DialogContent>
        <ContainerTreeView containers={containers} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>ok</Button>
      </DialogActions>
    </Dialog>
  );
};
