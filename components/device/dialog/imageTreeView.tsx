import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import BuildIcon from "@mui/icons-material/Build";
import AlbumIcon from "@mui/icons-material/Album";
import {ImageInfo} from "dockerode";
import moment from "moment";
import {StyledTreeItem} from "./containerTreeView";

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
<<<<<<< HEAD
 * Show list of docker installation
=======
 * Show list of docker installation-template
>>>>>>> upstream/install-script
 * @param images
 * @constructor
 */
export default function ImageTreeView({ images }: { images: ImageInfo[] }) {
  console.log(images);
  return (
    <TreeView
      aria-label="containers"
      defaultExpanded={["3"]}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ flexGrow: 1, overflowY: "auto" }}
    >
      {images.map((image, index) => (
        <StyledTreeItem
          key={`image-${index}`}
          nodeId={`${index}`}
          labelText={image.RepoTags.toString()}
          labelIcon={ArchiveIcon}
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
            nodeId="6"
            labelText={"Created time"}
            labelIcon={BuildIcon}
            labelInfo={moment(image.Created * 1000).format(
              "YYYY-MM-DD hh:mm:ss"
            )}
            color="#e3742f"
            bgColor="#fcefe3"
          />
          <StyledTreeItem
            nodeId="7"
            labelText="Maintainer "
            labelIcon={AccessTimeFilledIcon}
            labelInfo={image.Labels.maintainer}
            color="#a250f5"
            bgColor="#f3e8fd"
          />
        </StyledTreeItem>
      ))}
    </TreeView>
  );
}
