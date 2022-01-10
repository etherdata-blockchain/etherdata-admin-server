// @flow
import * as React from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { Error } from "@mui/icons-material";
import { DeviceContext } from "../../../pages/model/DeviceProvider";

/**
 * Pending job button
 * @param props
 * @constructor
 */
export function PendingJobButton() {
  const { realtimeStatus } = React.useContext(DeviceContext);

  return (
    <Tooltip title={"Pending jobs"}>
      <IconButton>
        <Badge badgeContent={realtimeStatus.pendingJobNumber} color={"error"}>
          <Error />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
