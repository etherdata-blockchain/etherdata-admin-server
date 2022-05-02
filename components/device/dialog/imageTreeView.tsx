import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import BuildIcon from "@mui/icons-material/Build";
import AlbumIcon from "@mui/icons-material/Album";
import { ImageInfo } from "dockerode";
import moment from "moment";
import { StyledTreeItem } from "./containerTreeView";
import { DeviceContext } from "../../../model/DeviceProvider";
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
import { LoadingButton } from "@mui/lab";

/**
 * Convert bytes to MB, GB, TB accordingly
 * @param bytes
 */
function bytesToSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

/**
 * Show list of docker installation-template
 * @param images
 * @constructor
 */
export default function ImageTreeView({ images }: { images: ImageInfo[] }) {
  return (
    <TreeView
      aria-label="containers"
      defaultExpanded={[]}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ flexGrow: 1, overflowY: "auto" }}
    >
      {images.map((image, index) => (
        <ImageDetailItem image={image} index={index} key={`image-${index}`} />
      ))}
    </TreeView>
  );
}

/**
 * Image detail item
 * @param image Docker image info
 * @param index index of this detail
 * @constructor
 */
export function ImageDetailItem({
  image,
  index,
}: {
  image: ImageInfo;
  index: number;
}) {
  const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] =
    React.useState(false);
  const { sendDockerCommand } = React.useContext(DeviceContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const popupState = usePopupState({
    variant: "popover",
    popupId: `image-${index}`,
  });

  const deleteImage = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await sendDockerCommand({
        method: "removeImage",
        value: image.Id,
      });
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(false);
      setOpenDeleteConfirmationDialog(false);
    }
  }, [image, sendDockerCommand]);

  return (
    <div>
      <StyledTreeItem
        nodeId={`${index}`}
        labelText={`${image?.RepoTags?.toString()}`}
        labelIcon={ArchiveIcon}
        {...bindContextMenu(popupState)}
      >
        <StyledTreeItem
          nodeId={`image-${index}-name`}
          labelIcon={AlbumIcon}
          labelInfo={bytesToSize(image.Size)}
          labelText={"Image size"}
          color="#1a73e8"
          bgColor="#e8f0fe"
        />
        <StyledTreeItem
          nodeId={`${image.Id}-6`}
          labelText={"Created time"}
          labelIcon={BuildIcon}
          labelInfo={moment(image.Created * 1000).format("YYYY-MM-DD hh:mm:ss")}
          color="#e3742f"
          bgColor="#fcefe3"
        />
        <StyledTreeItem
          nodeId={`${image.Id}-7`}
          labelText="Maintainer"
          labelIcon={AccessTimeFilledIcon}
          labelInfo={`${image?.Labels?.maintainer}`}
          color="#a250f5"
          bgColor="#f3e8fd"
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
          Delete image
        </MenuItem>
      </Menu>
      <Dialog
        open={openDeleteConfirmationDialog}
        onClose={() => setOpenDeleteConfirmationDialog(false)}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            This will delete image {image.Id} and will not be able to revert
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
              await deleteImage();
            }}
          >
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
