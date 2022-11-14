// @flow
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useDeviceAutoComplete } from "../../../hooks/useDeviceAutoComplete";

type Props = {
  id: string;
  defaultValues: string[];
  placeholder: string;
  label: string;
  readonly: boolean;
  onAdd(index: number, content: string): Promise<void>;
  onDelete(index: number): Promise<void>;
  onClear(): Promise<void>;
  minRows?: number;
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
      defaultValue={props.defaultValues as any}
      renderInput={(p) => (
        <TextField
          {...p}
          data-testid={"auto-complete"}
          label={props.label}
          variant={"filled"}
          multiline
          minRows={props.minRows ?? 1}
        />
      )}
      getOptionLabel={(o) => `${o}`}
      onInputChange={(e, value) => search(value)}
      options={options.map((o) => o.qr_code)}
      disabled={props.readonly}
      onChange={async (e, value, reason, details) => {
        if (value) {
          if (reason === "selectOption") {
            await props.onAdd(value.length - 1, details!.option);
          } else if (reason === "removeOption") {
            const index = selectedOptions.findIndex(
              (s) => s === details?.option
            );
            await props.onDelete(index);
          } else if (reason === "clear") {
            await props.onClear();
          }
          setSelectedOptions(value);
        }
      }}
    />
  );
}
