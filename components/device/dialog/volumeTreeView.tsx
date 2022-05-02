import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AlbumIcon from "@mui/icons-material/Album";
import { VolumeInspectInfo } from "dockerode";
import { StyledTreeItem } from "./containerTreeView";
import { AccessTime, AspectRatio, Dns } from "@mui/icons-material";
import { bindContextMenu, usePopupState } from "material-ui-popup-state/hooks";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { bindMenu } from "material-ui-popup-state";
import DeviceProvider, { DeviceContext } from "../../../model/DeviceProvider";
import { LoadingButton } from "@mui/lab";

/**
 * Show list of docker installation-template
 * @param images
 * @constructor
 */
export default function VolumeTreeView({
  volumes,
}: {
  volumes: VolumeInspectInfo[];
}) {
  return (
    <TreeView
      aria-label="containers"
      defaultExpanded={[]}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ flexGrow: 1, overflowY: "auto" }}
    >
      {volumes.map((volume, index) => (
        <VolumeDetailItem
          volume={volume}
          index={index}
          key={`volume-${index}`}
        />
      ))}
    </TreeView>
  );
}

/**
 * Display list of detail list item
 * @param volume volume info
 * @param index volume's index in the list
 * @constructor
 */
export function VolumeDetailItem({
  volume,
  index,
}: {
  volume: VolumeInspectInfo;
  index: number;
}) {
  const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] =
    React.useState(false);
  const { sendDockerCommand } = React.useContext(DeviceContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const popupState = usePopupState({
    variant: "popover",
    popupId: `volume-${index}`,
  });

  const deleteVolume = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await sendDockerCommand({
        method: "removeVolume",
        value: volume.Name,
      });
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(false);
      setOpenDeleteConfirmationDialog(false);
    }
  }, [volume, sendDockerCommand]);

  return (
    <div>
      <StyledTreeItem
        nodeId={`${index}`}
        labelText={`${volume.Name}`}
        labelIcon={ArchiveIcon}
        {...bindContextMenu(popupState)}
      >
        <StyledTreeItem
          nodeId={`volume-${index}-name`}
          labelIcon={Dns}
          labelInfo={volume.Name}
          labelText={"Name"}
          color="#1a73e8"
          bgColor="#e8f0fe"
        />

        <StyledTreeItem
          nodeId={`volume-${index}-size`}
          labelIcon={AspectRatio}
          labelInfo={volume.Mountpoint}
          labelText={"Mount point"}
          color="#1a73e8"
          bgColor="#e8f0fe"
        />

        <StyledTreeItem
          nodeId={`volume-${index}-driver`}
          labelIcon={AlbumIcon}
          labelInfo={volume.Driver}
          labelText={"Driver"}
          color="#1a73e8"
          bgColor="#e8f0fe"
        />

        <StyledTreeItem
          nodeId={`volume-${index}-createdAt`}
          labelIcon={AccessTime}
          labelInfo={(volume as any).CreatedAt}
          labelText={"Created At"}
          color="#1a73e8"
          bgColor="#e8f0fe"
        />
      </StyledTreeItem>
      <Menu
        {...bindMenu(popupState)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            popupState.close();
            setOpenDeleteConfirmationDialog(true);
          }}
        >
          Delete volume
        </MenuItem>
      </Menu>

      <Dialog
        open={openDeleteConfirmationDialog}
        onClose={() => setOpenDeleteConfirmationDialog(false)}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            This will delete volume {volume.Name} and will not be able to revert
            this action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirmationDialog(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading}
            onClick={async () => {
              await deleteVolume();
            }}
          >
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
