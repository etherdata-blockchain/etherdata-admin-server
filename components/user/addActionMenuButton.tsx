// @flow
import * as React from "react";
import { usePopupState } from "material-ui-popup-state/hooks";
import { Button, Menu, MenuItem } from "@mui/material";
import { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useRouter } from "next/dist/client/router";
import { RegisterDevicesDialog } from "./registerDevicesDialog";
import { AddDeviceDialog } from "./addDeviceDialog";
import ReactJsonFormProvider from "../../model/ReactJsonFormProvider";

type Props = {
  userId: string;
};

/**
 * Show list of action menus
 * @param props
 * @constructor
 */
export function AddActionMenuButton(props: Props) {
  const [showDevicesDialog, setShowDevicesDialog] = React.useState(false);
  const [showAddDeviceDialog, setShowAddDeviceDialog] = React.useState(false);

  const router = useRouter();
  const popupState = usePopupState({
    popupId: "action-state",
    variant: "popper",
  });

  return (
    <ReactJsonFormProvider>
      <div>
        <Button variant={"contained"} {...bindTrigger(popupState)}>
          Actions
        </Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem
            onClick={() => {
              setShowDevicesDialog(true);
              popupState.close();
            }}
          >
            Register Devices
          </MenuItem>
          <MenuItem
            onClick={() => {
              setShowAddDeviceDialog(true);
              popupState.close();
            }}
          >
            Add Device
          </MenuItem>
        </Menu>
        <RegisterDevicesDialog
          userId={props.userId}
          onClose={() => {
            setShowDevicesDialog(false);
            router.reload();
          }}
          open={showDevicesDialog}
        />

        <AddDeviceDialog
          userId={props.userId}
          onClose={() => {
            setShowAddDeviceDialog(false);
          }}
          open={showAddDeviceDialog}
        />
      </div>
    </ReactJsonFormProvider>
  );
}
