// @flow
import * as React from "react";
import { Avatar, Button, Chip, Stack, Typography } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { RegisterDevicesBtn } from "./registerDevicesBtn";

type Props = {
  username?: string;
  userId?: string;
  coinbase?: string;
};

/**
 * Display user's info on the main screen
 * @param username
 * @param userId
 * @param coinbase
 * @constructor
 */
export function UserAvatar({ username, userId, coinbase }: Props) {
  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <Avatar sx={{ bgcolor: deepOrange[500] }}>
          {(username?.length ?? 0) > 0 && username![0].toUpperCase()}
        </Avatar>
        <Stack>
          <Typography variant={"h5"} fontWeight={"bolder"}>
            {username}
          </Typography>
          <Typography>
            <Chip
              label={(coinbase?.length ?? 0) > 0 ? coinbase : "None"}
              size={"small"}
            />
          </Typography>
        </Stack>
      </Stack>
      <div>{userId && <RegisterDevicesBtn userId={userId} />}</div>
    </Stack>
  );
}
