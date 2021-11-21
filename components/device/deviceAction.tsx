// @flow
import * as React from "react";
import { Button, ListItemText, Menu, MenuItem, TextField } from "@mui/material";
import { DeviceContext } from "../../pages/model/DeviceProvider";
import { useRouter } from "next/dist/client/router";
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";

import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import moment from "moment";
import { DefaultPaginationResult } from "../../server/const/defaultValues";

type Props = {};

export function DeviceAction(props: Props) {
  const filterState = usePopupState({ variant: "popover", popupId: "filter" });
  const adminState = usePopupState({ variant: "popper", popupId: "admin" });
  const onlineState = usePopupState({ variant: "popper", popupId: "online" });
  const nodeVersionState = usePopupState({
    variant: "popper",
    popupId: "node",
  });

  const {
    filterKeyword,
    setFilterKeyword,
    paginationResult,
    applyFilter,
    clearFilter,
  } = React.useContext(DeviceContext);
  const router = useRouter();
  const { adminVersions, nodeVersions, clientFilter } =
    paginationResult ?? DefaultPaginationResult;

  const handleOnAdminVersionClick = (version: string) => {
    applyFilter({ key: "adminVersion", value: version });
    adminState.close();
    filterState.close();
  };

  const handleOnNodeVersionClick = (version: string) => {
    applyFilter({ key: "data.systemInfo.nodeVersion", value: version });
    nodeVersionState.close();
    filterState.close();
  };

  const handleOnlineStatus = (isOnline: boolean) => {
    const now = moment().subtract(10, "minutes");

    if (isOnline) {
      applyFilter({ key: "lastSeen", value: { $gt: now.toDate() } });
    } else {
      applyFilter({ key: "lastSeen", value: { $lt: now.toDate() } });
    }

    onlineState.close();
    filterState.close();
  };

  const handleOnAllClick = () => {
    clearFilter();
    adminState.close();
    nodeVersionState.close();
    filterState.close();
  };
  return (
    <div
      style={{
        alignItems: "center",
        display: "flow",
        justifyItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      <Button
        {...bindTrigger(filterState)}
        style={{ marginTop: 15, marginBottom: "auto", marginRight: 20 }}
      >
        Filters
      </Button>
      <Menu {...bindMenu(filterState)}>
        <MenuItem key={"All"} onClick={handleOnAllClick}>
          All
        </MenuItem>
        <MenuItem {...bindTrigger(nodeVersionState)}>
          Node Versions <ArrowRightIcon />
        </MenuItem>
        <MenuItem {...bindTrigger(adminState)}>
          Admin Versions <ArrowRightIcon />
        </MenuItem>
        <MenuItem {...bindTrigger(onlineState)}>
          Online Status <ArrowRightIcon />
        </MenuItem>
      </Menu>

      <Menu
        {...bindMenu(adminState)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
      >
        {adminVersions?.map((a, i) => (
          <MenuItem
            key={`admin-version-${i}`}
            onClick={() => handleOnAdminVersionClick(a.version)}
            selected={clientFilter?.value === a.version}
          >
            <ListItemText
              primary={a.version ?? "No Data"}
              secondary={`Count: ${a.count}`}
            />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        {...bindMenu(nodeVersionState)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
      >
        {nodeVersions?.map((a, i) => (
          <MenuItem
            key={`node-version-${i}`}
            selected={clientFilter?.value === a.version}
            onClick={() => handleOnNodeVersionClick(a.version)}
          >
            <ListItemText
              primary={a.version ?? "No Data"}
              secondary={`Count: ${a.count}`}
            />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        {...bindMenu(onlineState)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleOnlineStatus(true)}>
          <ListItemText primary={"Online"} />
        </MenuItem>
        <MenuItem onClick={() => handleOnlineStatus(false)}>
          <ListItemText primary={"Offline"} />
        </MenuItem>
      </Menu>

      <TextField
        label={"Device ID"}
        style={{ width: 500, marginRight: 20 }}
        variant={"standard"}
        value={filterKeyword}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            await router.push("/user/" + filterKeyword);
          }
        }}
        onChange={(e) => {
          setFilterKeyword(e.target.value);
        }}
      />
    </div>
  );
}
