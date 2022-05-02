// @flow
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { throttle } from "lodash";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import { configs, interfaces, utils } from "@etherdata-blockchain/common";
import qs from "query-string";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

type Props = {
  defaultValues?: interfaces.db.DockerImageDBInterface[];
  selection: any;
  label: string;
  id: string;
  placeholder: string;
  onChange(value: interfaces.db.DockerImageDBInterface): void;
};

/**
 * A Docker image auto complete text field
 * Will automatically fetch docker images info based on typing
 * @param props
 * @constructor
 */
export function DockerImageAutocompleteTextField(props: Props) {
  const [options, setOptions] = React.useState<
    interfaces.db.DockerImageDBInterface[]
  >(utils.expandImages(props.defaultValues ?? ([] as any)) as any);
  const [isLoading, setIsLoading] = React.useState(false);

  const search = React.useCallback(
    throttle(async (newValue: string) => {
      // Split key by semicolon
      // Only search by image name
      const searchKey = newValue.includes(":")
        ? newValue.split(":")[0]
        : newValue;
      if (newValue.length === 0) {
        setOptions(
          utils.expandImages(props.defaultValues ?? ([] as any)) as any
        );
        return;
      }
      try {
        setIsLoading(true);
        const url = qs.stringifyUrl({
          url: Routes.dockerSearchAPI,
          query: { key: searchKey },
        });
        const result = await getAxiosClient().get(url);
        setOptions(utils.expandImages(result.data) as any);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    }, configs.Configurations.defaultThrottleDuration),
    []
  );

  return (
    <Autocomplete
      id={props.id}
      defaultValue={
        Object.keys(props.selection).length === 0 ? undefined : props.selection
      }
      renderInput={(params) => (
        <TextField {...params} variant="filled" label={props.label} />
      )}
      options={options}
      getOptionLabel={(o: interfaces.db.DockerImageDBInterface) => {
        if (o.tags?.length > 0) {
          return `${o.imageName}:${o.tags[0].tag}`;
        } else if (o.tag && typeof o.tag === "object" && o.tag.tag) {
          return `${o.imageName}:${o.tag.tag}`;
        } else if (typeof o.tags === "object") {
          return `${o.imageName}:${(o.tags as any).tag}`;
        }
        return "Invalid value";
      }}
      loading={isLoading}
      onInputChange={(e, value) => search(value)}
      onChange={(e, value) => {
        if (value) {
          props.onChange(value);
        }
      }}
    />
  );
}
