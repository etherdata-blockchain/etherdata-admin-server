// @flow
import * as React from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { schema } from "@etherdata-blockchain/storage-model";

type Props = {
  device: schema.IDevice | undefined;
};

/**
 * Docker panel for docker operations
 * @param props
 * @constructor
 */
export function DockerPanel(props: Props) {
  const filterState = usePopupState({ variant: "popper", popupId: "filter" });
  const selectionState = usePopupState({
    variant: "popper",
    popupId: "selection",
  });

  return (
    <List>
      <ListItemButton {...bindTrigger(filterState)}>
        <ListItemText primary={"Select"} secondary={"image or container"} />
      </ListItemButton>

      <ListItemButton {...bindTrigger(selectionState)}>
        <ListItemText primary={"Image"} secondary={"Image name"} />
      </ListItemButton>

      <Menu {...bindMenu(filterState)}>
        <MenuItem
          key={"image"}
          onClick={() => {
            filterState.close();
          }}
        >
          Image
        </MenuItem>
        <MenuItem
          key={"container"}
          onClick={() => {
            filterState.close();
          }}
        >
          Container
        </MenuItem>
      </Menu>

      <Menu {...bindMenu(selectionState)}>
        <MenuItem
          key={"image"}
          onClick={() => {
            selectionState.close();
          }}
        >
          Image
        </MenuItem>
        <MenuItem
          key={"container"}
          onClick={() => {
            selectionState.close();
          }}
        >
          Container
        </MenuItem>
      </Menu>
    </List>
  );
}

// <Grid container>
//   <Grid
//     item
//     xs={11}
//     justifyContent={"start"}
//     alignItems={"center"}
//     display={"grid"}
//   >
//     <Typography>Select</Typography>
//   </Grid>
//   <Grid item xs={1}>

//   </Grid>
//   <Grid
//     item
//     xs={5}
//     justifyContent={"start"}
//     alignItems={"center"}
//     display={"grid"}
//   >
//     <Typography>Image</Typography>
//   </Grid>
//   <Grid item xs={7}>

//   </Grid>
// </Grid>
