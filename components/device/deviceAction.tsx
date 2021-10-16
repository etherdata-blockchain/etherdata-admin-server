// @flow
import * as React from "react";
import {
  Button,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@material-ui/core";
import { DeviceContext } from "../../pages/model/DeviceProvider";
import { useRouter } from "next/dist/client/router";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
  bindHover,
} from "material-ui-popup-state/hooks";

import ArrowRightIcon from "@material-ui/icons/arrowRight";

type Props = {};

export function DeviceAction(props: Props) {
  const filterState = usePopupState({ variant: "popover", popupId: "filter" });
  const adminState = usePopupState({ variant: "popper", popupId: "admin" });
  const nodeVersionState = usePopupState({
    variant: "popper",
    popupId: "node",
  });

  const {
    filterKeyword,
    setFilterKeyword,
    adminVersions,
    nodeVersions,
    currentFilter,
    applyFilter,
    clearFilter,
  } = React.useContext(DeviceContext);
  const router = useRouter();
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
        <MenuItem {...bindTrigger(nodeVersionState)}>
          Node Versions <ArrowRightIcon />
        </MenuItem>
        <MenuItem {...bindTrigger(adminState)}>
          Admin Versions <ArrowRightIcon />
        </MenuItem>
      </Menu>

      <Menu
        {...bindMenu(adminState)}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
      >
        <MenuItem key={"All"} onClick={handleOnAllClick}>
          All
        </MenuItem>
        {adminVersions?.map((a, i) => (
          <MenuItem
            key={`admin-version-${i}`}
            onClick={() => handleOnAdminVersionClick(a.version)}
            selected={currentFilter?.value === a.version}
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
        <MenuItem key={"All"} onClick={handleOnAllClick}>
          All
        </MenuItem>
        {nodeVersions?.map((a, i) => (
          <MenuItem
            key={`node-version-${i}`}
            selected={currentFilter?.value === a.version}
            onClick={() => handleOnNodeVersionClick(a.version)}
          >
            <ListItemText
              primary={a.version ?? "No Data"}
              secondary={`Count: ${a.count}`}
            />
          </MenuItem>
        ))}
      </Menu>

      <TextField
        label={"Device ID"}
        style={{ width: 500, marginRight: 20 }}
        variant={"standard"}
        value={filterKeyword}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            await router.push("/device/" + filterKeyword);
          }
        }}
        onChange={(e) => {
          setFilterKeyword(e.target.value);
        }}
      />
    </div>
  );
}
