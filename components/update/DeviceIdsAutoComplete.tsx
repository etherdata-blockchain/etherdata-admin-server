// @flow
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useDeviceAutoComplete } from "../hooks/useDeviceAutoComplete";

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
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(
    props.defaultValues
  );
  const { isLoading, options, search } = useDeviceAutoComplete();

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
      options={options.map((o) => o.qr_code)}
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
