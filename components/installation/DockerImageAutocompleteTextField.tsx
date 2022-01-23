// @flow
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { throttle } from "lodash";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { configs, utils } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import qs from "query-string";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

type Props = {
  defaultValues?: schema.IDockerImage[];
  selection: any;
  label: string;
  id: string;
  placeholder: string;
  onChange(value: schema.IDockerImage): void;
};

/**
 * A Docker image auto complete text field
 * Will automatically fetch docker images info based on typing
 * @param props
 * @constructor
 */
export function DockerImageAutocompleteTextField(props: Props) {
  const [options, setOptions] = React.useState<schema.IDockerImage[]>(
    utils.expandImages(props.defaultValues ?? ([] as any)) as any
  );
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
      getOptionLabel={(o: schema.IDockerImage) => {
        if (o.tags?.length > 0) {
          return `${o.imageName}:${o.tags[0].tag}`;
        } else if (o.tag) {
          return `${o.imageName}:${o.tag.tag}`;
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
