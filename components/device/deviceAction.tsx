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
import { set } from "mongoose";

type Props = {};

export function DeviceAction(props: Props) {
  const [adminEl, setAdminEl] = React.useState<null | HTMLElement>(null);
  const [versionEL, setVersionEL] = React.useState<null | HTMLElement>(null);
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

  const handleOpenAdminVersions = (e: React.MouseEvent<HTMLElement>) => {
    setAdminEl(e.currentTarget);
  };

  const handleCloseAdminVersions = () => {
    setAdminEl(null);
    setVersionEL(null);
  };

  const handleOpenNodeVersions = (e: React.MouseEvent<HTMLElement>) => {
    setVersionEL(e.currentTarget);
    setAdminEl(null);
  };

  const handleCloseNodeVersions = () => {
    setVersionEL(null);
  };

  const handleOnAdminVersionClick = (version: string) => {
    applyFilter({ key: "adminVersion", value: version });
    setAdminEl(null);
  };

  const handleOnNodeVersionClick = (version: string) => {
    applyFilter({ key: "data.systemInfo.nodeVersion", value: version });
    setVersionEL(null);
  };

  const handleOnAllClick = () => {
    clearFilter();
    setVersionEL(null);
    setAdminEl(null);
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
      <Button onClick={handleOpenAdminVersions}>Admin Versions</Button>
      <Button color={"primary"} onClick={handleOpenNodeVersions}>
        Node Versions
      </Button>

      <Menu
        open={adminEl !== null}
        anchorEl={adminEl}
        onClose={handleCloseAdminVersions}
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
        open={versionEL !== null}
        anchorEl={versionEL}
        onClose={handleCloseNodeVersions}
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
    </div>
  );
}
