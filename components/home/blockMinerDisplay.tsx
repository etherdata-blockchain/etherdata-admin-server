// @flow
import * as React from "react";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";

type Props = {};

/**
 * List of miners display
 * @param props
 * @constructor
 */
export function BlockMinerDisplay(props: Props) {
  return (
    <List>
      <ListItemButton>
        <ListItemText
          primary={"Miner"}
          secondary={<Typography noWrap={true}>a</Typography>}
        />
      </ListItemButton>
      <ListItemButton>
        <ListItemText
          primary={"Miner"}
          secondary={<Typography noWrap={true}>a</Typography>}
        />
      </ListItemButton>
    </List>
  );
}
