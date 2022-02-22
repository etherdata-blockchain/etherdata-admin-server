// @flow
import * as React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { MoreVert } from "@mui/icons-material";

type Props = {};

/**
 * Pick duration for display. [TODO]
 * @param props
 * @constructor
 */
export function DurationSelectorBtn(props: Props) {
  return (
    <PopupState variant={"popover"}>
      {(popupState) => (
        <React.Fragment>
          <IconButton {...bindTrigger(popupState)}>
            <MoreVert />
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
