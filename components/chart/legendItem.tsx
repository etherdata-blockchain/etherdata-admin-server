// @flow
import * as React from "react";
import { Divider, Stack, Typography } from "@mui/material";

type Props = {
  /**
   * Legend's color
   */
  color: string;
  /**
   * Legend's title
   */
  title: string;
  /**
   * Legend's count
   */
  count: number;
  /**
   * Legend's size
   */
  size: number;
};

/**
 * A legend item display admin and node version distributions
 * @param props
 * @constructor
 */
export function LegendItem(props: Props) {
  return (
    <Stack direction={"row"} spacing={2} p={1} alignItems={"center"}>
      <div
        style={{
          height: props.size,
          width: props.size,
          backgroundColor: props.color,
          borderRadius: "50%",
        }}
      />
      <Typography variant={"subtitle1"} fontWeight={"bolder"}>
        {props.title}
      </Typography>

      <Typography variant={"subtitle1"}>{props.count}</Typography>
    </Stack>
  );
}
