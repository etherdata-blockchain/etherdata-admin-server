// @flow
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { throttle } from "lodash";
import { Configurations } from "../../internal/const/configurations";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { Routes } from "../../internal/const/routes";
import qs from "query-string";
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import { expandImages } from "../../internal/services/dbSchema/install-script/install-script-utils";

type Props = {
  defaultValues?: IDockerImage[];
  selection: any;
  label: string;
  id: string;
  placeholder: string;
  onChange(value: IDockerImage): void;
};

/**
 * A Docker image auto complete text field
 * Will automatically fetch docker images info based on typing
 * @param props
 * @constructor
 */
export function DockerImageAutocompleteTextField(props: Props) {
  const [options, setOptions] = React.useState<IDockerImage[]>(
    expandImages(props.defaultValues ?? [])
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
        setOptions(expandImages(props.defaultValues ?? []));
        return;
      }
      try {
        setIsLoading(true);
        const url = qs.stringifyUrl({
          url: Routes.dockerSearchAPI,
          query: { key: searchKey },
        });
        const result = await getAxiosClient().get(url);
        setOptions(expandImages(result.data));
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    }, Configurations.defaultThrottleDuration),
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
      getOptionLabel={(o: IDockerImage) => {
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
