// @flow
import * as React from "react";
import { Box } from "@mui/material";
import { configs } from "@etherdata-blockchain/common";

type Props = {
  children: any;
};

/**
 * Add padding to both left and right
 * @param props
 * @constructor
 */
export function PaddingBox(props: Props) {
  return (
    <Box
      style={{
        paddingLeft: configs.Configurations.defaultPadding,
        paddingRight: configs.Configurations.defaultPadding,
      }}
    >
      {props.children}
    </Box>
  );
}
