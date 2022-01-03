// @flow
import * as React from "react";
import { Box } from "@mui/material";
import { Configurations } from "../../internal/const/configurations";

type Props = {
  children: any;
};

export function PaddingBox(props: Props) {
  return (
    <Box
      style={{
        paddingLeft: Configurations.defaultPadding,
        paddingRight: Configurations.defaultPadding,
      }}
    >
      {props.children}
    </Box>
  );
}
