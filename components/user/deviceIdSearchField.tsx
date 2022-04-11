// @flow
import * as React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, TextField } from "@mui/material";

type Props = {};

/**
 * Search device by id
 * @param props
 * @constructor
 */
export function DeviceIdSearchField(props: Props) {
  return (
    <Box m={2}>
      <TextField
        variant={"filled"}
        fullWidth
        placeholder={"Device ID"}
        InputProps={{
          startAdornment: (
            <InputAdornment position={"start"}>
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
