import { JSONSchema7 } from "json-schema";
import { configs } from "@etherdata-blockchain/common";

export interface QueryParameter {
  page: number;
  pageSize: string;
}

export const queryParameterSchema: JSONSchema7 = {
  properties: {
    page: {
      type: "number",
      default: configs.Configurations.defaultPaginationStartingPage,
    },
    pageSize: {
      type: "number",
      default: configs.Configurations.numberPerPage,
    },
  },
};
