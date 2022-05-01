// @flow
import * as React from "react";
import { Button } from "@mui/material";
import { RegisterDevicesDialog } from "./registerDevicesDialog";

type Props = {
  userId: string;
};

/**
 * Register button.
 * @param props
 * @constructor
 */
export function RegisterDevicesBtn(props: Props) {
  const [showDevicesDialog, setShowDevicesDialog] = React.useState(false);

  return (
    <div>
      <Button variant={"contained"} onClick={() => setShowDevicesDialog(true)}>
        Register Devices
      </Button>
      <RegisterDevicesDialog
        userId={props.userId}
        onClose={() => setShowDevicesDialog(false)}
        open={showDevicesDialog}
      />
    </div>
  );
}
