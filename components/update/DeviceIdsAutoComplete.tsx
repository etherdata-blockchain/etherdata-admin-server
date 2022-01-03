// @flow
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { throttle } from "lodash";
import qs from "query-string";
import { Routes } from "../../internal/const/routes";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { Configurations } from "../../internal/const/configurations";
import { IStorageItem } from "../../internal/services/dbSchema/device/storage/item";

type Props = {
  id: string;
  defaultValues: string[];
  onChange(v: string): [];
  placeholder: string;
  label: string;
};

/**
 * Device ID Auto complete field. Onchange field will call with a string representation of the array of string.
 * Default value will be an array of string
 * @param props
 * @constructor
 */
export function DeviceIdsAutoComplete(props: Props) {
  const [options, setOptions] = React.useState<IStorageItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const search = React.useCallback(
    throttle(async (newValue: string) => {
      try {
        setIsLoading(true);
        const url = qs.stringifyUrl({
          url: Routes.itemSearch,
          query: { key: newValue },
        });
        const result = await getAxiosClient().get(url);
        setOptions(result.data);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    }, Configurations.defaultThrottleDuration),
    []
  );

  return (
    <Autocomplete
      multiple
      id={props.id}
      loading={isLoading}
      renderInput={(p) => (
        <TextField {...p} label={props.label} variant={"filled"} />
      )}
      getOptionLabel={(o) => `${o.name} - ${o.qr_code}`}
      onInputChange={(e, value) => search(value)}
      options={options}
      onChange={(e, value) => {
        if (value) {
          props.onChange(JSON.stringify(value.map((v) => v.qr_code)));
        }
      }}
    />
  );
}
