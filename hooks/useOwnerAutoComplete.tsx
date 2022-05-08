// @flow
import * as React from "react";
import { throttle } from "lodash";
import qs from "query-string";
import { getAxiosClient } from "../internal/const/defaultValues";
import { configs, interfaces } from "@etherdata-blockchain/common";

/**
 * Provide an owner auto complete hook. Will return a list of owners with provided search term.
 */
export function useOwnerAutoComplete() {
  const [options, setOptions] = React.useState<
    interfaces.db.StorageUserDBInterface[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState();

  const search = React.useCallback(
    throttle(async (newValue: string) => {
      try {
        setIsLoading(true);
        const url = qs.stringifyUrl({
          url: configs.Routes.ownerSearch,
          query: { key: newValue },
        });
        const result = await getAxiosClient().get(url);
        setOptions(result.data);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    }, configs.Configurations.defaultThrottleDuration),
    []
  );

  return { isLoading, options, search, error };
}
