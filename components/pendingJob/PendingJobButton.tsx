// @flow
import * as React from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { Error } from "@mui/icons-material";
import { DeviceContext } from "../../model/DeviceProvider";
import { UIProviderContext } from "../../model/UIProvider";
import { PendingJobPanel } from "./PendingJobPanel";

/**
 * Pending job button
 * @param props
 * @constructor
 */
export function PendingJobButton() {
  const { realtimeStatus } = React.useContext(DeviceContext);
  const { setMessageDrawerOpen, setMessageDrawerContent } =
    React.useContext(UIProviderContext);

  return (
    <Tooltip title={"Pending jobs"}>
      <IconButton
        onClick={() => {
          setMessageDrawerOpen(true);
          setMessageDrawerContent(<PendingJobPanel />);
        }}
      >
        <Badge badgeContent={realtimeStatus.pendingJobNumber} color={"error"}>
          <Error />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
