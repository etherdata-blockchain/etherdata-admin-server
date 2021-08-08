// @flow
import * as React from "react";
import { Button, Stack, TextField } from "@material-ui/core";
import { DeviceContext } from "../../pages/model/DeviceProvider";

type Props = {};

export function DeviceAction(props: Props) {
  const { filterKeyword, setFilterKeyword } = React.useContext(DeviceContext);

  return (
    <TextField
      label={"Device ID"}
      style={{ width: 500, marginRight: 20 }}
      variant={"standard"}
      value={filterKeyword}
      onChange={(e) => {
        setFilterKeyword(e.target.value);
      }}
    />
  );
}
