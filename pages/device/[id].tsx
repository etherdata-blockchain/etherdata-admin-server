// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import ResponsiveCard from "../../components/ResponsiveCard";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Typography,
} from "@material-ui/core";

type Props = {};

export default function TransactionDetail(props: Props) {
  return (
    <div>
      <PageHeader title={"Device"} description={"a"} />
      <Spacer height={20} />
      <ResponsiveCard>
        <List>
          <ListItem>
            <ListItemText primary={"Device ID"} secondary={"abc"} />
          </ListItem>

          <ListItem>
            <ListItemText primary={"Device Name"} secondary={"abcde"} />
          </ListItem>

          <ListSubheader>Peers</ListSubheader>
          <ListItem>
            <ListItemAvatar>1</ListItemAvatar>
            <ListItemText primary={"Device IP"} secondary={"abcde"} />
          </ListItem>
        </List>
      </ResponsiveCard>
    </div>
  );
}
