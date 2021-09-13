// @flow
import * as React from "react";
import { Button, Stack, TextField } from "@material-ui/core";
import { DeviceContext } from "../../pages/model/DeviceProvider";
import { useRouter } from "next/dist/client/router";

type Props = {};

export function DeviceAction(props: Props) {
  const { filterKeyword, setFilterKeyword } = React.useContext(DeviceContext);
  const router = useRouter();

  return (
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
  );
}
