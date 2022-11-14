// @flow
import * as React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Box, InputBase, Stack } from "@mui/material";
import { useDeviceAutoComplete } from "../../../hooks/useDeviceAutoComplete";
import { useRouter } from "next/dist/client/router";
import { configs } from "@etherdata-blockchain/common";
import urlJoin from "@etherdata-blockchain/url-join";

type Props = {};

/**
 * Search device by id
 * @param props
 * @constructor
 */
export function DeviceIdSearchField(props: Props) {
  const { isLoading, options, search, error } = useDeviceAutoComplete();
  const router = useRouter();

  return (
    <Box
      m={2}
      p={1}
      borderRadius={4}
      border={"1px solid rgb(224, 227, 231)"}
      minWidth={400}
    >
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <SearchIcon />
        <Autocomplete
          options={options}
          getOptionLabel={(o: any) => `${o.qr_code}`}
          loading={isLoading}
          onInputChange={(e, value) => search(value)}
          onChange={async (e, newValue) => {
            if (newValue?.qr_code) {
              await router.push(
                urlJoin(configs.Routes.deviceDetailPage, newValue!.qr_code)
              );
            }
          }}
          fullWidth
          renderInput={(params) => {
            const { InputLabelProps, InputProps, ...rest } = params;
            return (
              <InputBase {...InputProps} {...rest} placeholder={"Device ID"} />
            );
          }}
        />
      </Stack>
    </Box>
  );
}
