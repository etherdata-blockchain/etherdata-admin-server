// @flow
import * as React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@material-ui/core";

type Props = {};

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
