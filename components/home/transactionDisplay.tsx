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

export function TransactionDisplay(props: Props) {
  return (
    <List>
      <ListItemButton>
        <ListItemText
          primary={<Typography noWrap>abcd</Typography>}
          secondary={<Typography noWrap={true}>200 ETD</Typography>}
        />
      </ListItemButton>
      <ListItemButton>
        <ListItemText
          primary={<Typography noWrap>abcd</Typography>}
          secondary={<Typography noWrap={true}>200 ETD</Typography>}
        />
      </ListItemButton>
    </List>
  );
}
