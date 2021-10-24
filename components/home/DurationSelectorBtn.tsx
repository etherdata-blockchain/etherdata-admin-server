// @flow
import * as React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

type Props = {};

export function DurationSelectorBtn(props: Props) {
  return (
    <PopupState variant={"popover"}>
      {(popupState) => (
        <React.Fragment>
          <IconButton {...bindTrigger(popupState)}>
            <MoreVertIcon />
          </IconButton>

          <Menu {...bindMenu(popupState)}>
            <MenuItem>Last 7 days</MenuItem>
            <MenuItem>Last month</MenuItem>
            <MenuItem>Last year</MenuItem>
            <MenuItem>All History</MenuItem>
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
}
