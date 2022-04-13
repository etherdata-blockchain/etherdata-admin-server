import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses, TreeItemProps } from "@mui/lab/TreeItem";
import Typography from "@mui/material/Typography";
import ArchiveIcon from "@mui/icons-material/Archive";
import InfoIcon from "@mui/icons-material/Info";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import BuildIcon from "@mui/icons-material/Build";
import AlbumIcon from "@mui/icons-material/Album";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { ContainerInfo } from "dockerode";
import moment from "moment";
import { DeviceContext } from "../../../pages/model/DeviceProvider";
import { UIProviderContext } from "../../../pages/model/UIProvider";
import { CircularProgress, List, ListItemButton } from "@mui/material";
import { interfaces } from "@etherdata-blockchain/common";

declare module "react" {
  // eslint-disable-next-line no-unused-vars
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

export type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
  labelText: string;
};

export const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

// eslint-disable-next-line require-jsdoc
export function StyledTreeItem(props: StyledTreeItemProps) {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    ...other
  } = props;

  return (
    // @ts-ignore
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "inherit", flexGrow: 1 }}
          >
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      {...other}
    />
  );
}

/**
 * Show list of containers
 * @param containers
 * @constructor
 */
export default function ContainerTreeView({
  containers,
}: {
  containers: interfaces.db.ContainerInfoWithLog[];
}) {
  return (
    <TreeView
      aria-label="containers"
      defaultExpanded={["3"]}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ flexGrow: 1, overflowY: "auto" }}
    >
      {containers.map((container, index) => (
        <StyledTreeItem
          data-testid={`container-${index}`}
          key={`container-${index}`}
          nodeId={`${index}`}
          labelText={container.Names.toString()}
          labelIcon={ArchiveIcon}
        >
          <StyledTreeItem
            nodeId={`container-${index}-name`}
            labelIcon={AlbumIcon}
            labelInfo={container.Image}
            labelText={"Image name"}
            color="#1a73e8"
            bgColor="#e8f0fe"
          />
          <StyledTreeItem
            nodeId={`${container.Id}-6`}
            labelText={"Created time"}
            labelIcon={BuildIcon}
            labelInfo={moment(container.Created * 1000).format(
              "YYYY-MM-DD hh:mm:ss"
            )}
            color="#e3742f"
            bgColor="#fcefe3"
          />
          <StyledTreeItem
            nodeId={`${container.Id}-7`}
            labelText="Status"
            labelIcon={AccessTimeFilledIcon}
            labelInfo={container.Status}
            color="#a250f5"
            bgColor="#f3e8fd"
          />
          <StyledTreeItem
            nodeId={`${container.Id}-8`}
            labelText="State"
            labelIcon={InfoIcon}
            labelInfo={container.State}
            color="#3c8039"
            bgColor="#e6f4ea"
          />

          <StyledTreeItem
            nodeId={`log-${container.Id}`}
            data-testid={`log-${container.Id}`}
            labelIcon={InfoIcon}
            labelText={"Logs"}
          >
            <Box pl={10} color={"black"} pt={1}>
              <List>
                {container.logs?.split("\n").map((r, i) => (
                  <ListItemButton key={`r-${i}`}>{r}</ListItemButton>
                ))}
              </List>
            </Box>
          </StyledTreeItem>
        </StyledTreeItem>
      ))}
    </TreeView>
  );
}
