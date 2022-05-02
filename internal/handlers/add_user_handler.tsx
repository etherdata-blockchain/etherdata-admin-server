import { schema as commonSchema } from "@etherdata-blockchain/common";
import { JSONSchema7 } from "json-schema";

export const schema: JSONSchema7 = {
  ...(commonSchema.storageInterfaceSchema.definitions
    .StorageUserDBInterface as any),
};
