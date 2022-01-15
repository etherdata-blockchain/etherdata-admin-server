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
  placeholder: string;
  label: string;
  readonly: boolean;
  onAdd(index: number, content: string): Promise<void>;
  onDelete(index: number): Promise<void>;
};

/**
 * Device ID Auto complete field. Onchange field will call with a string representation of the array of string.
 * Default value will be an array of string
 * @param props
 * @constructor
 */
export function DeviceIdsAutoComplete(props: Props) {
  const [options, setOptions] = React.useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(
    props.defaultValues
  );
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
        setOptions((result.data as IStorageItem[]).map((s) => s.qr_code));
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
      defaultValue={props.defaultValues}
      renderInput={(p) => (
        <TextField {...p} label={props.label} variant={"filled"} />
      )}
      getOptionLabel={(o) => `${o}`}
      onInputChange={(e, value) => search(value)}
      options={options}
      disabled={props.readonly}
      onChange={(e, value, reason, details) => {
        if (value) {
          if (reason === "selectOption") {
            props.onAdd(value.length - 1, details!.option);
          } else if (reason === "removeOption") {
            const index = selectedOptions.findIndex(
              (s) => s === details?.option
            );
            props.onDelete(index);
          }
          setSelectedOptions(value);
        }
      }}
    />
  );
}
