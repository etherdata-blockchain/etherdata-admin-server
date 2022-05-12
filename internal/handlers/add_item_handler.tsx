import { schema as commonSchema } from "@etherdata-blockchain/common";
import { JSONSchema7 } from "json-schema";

const getProperties = (): any => {
  const properties = commonSchema.storageInterfaceSchema.definitions
    .StorageItemDBInterface.properties as any;

  delete properties.name;
  delete properties.description;
  delete properties.owner_name;
  delete properties.images;
  delete properties.images_objects;
  delete properties.created_time;
  delete properties.row;
  delete properties.column;
  delete properties.price;
  delete properties.uuid;
  delete properties.machine_type_name;
  delete properties.position_name;
  delete properties.location_name;
  delete properties.owner_id;
  return properties;
};

const getRequired = (): any => {
  const required =
    commonSchema.storageInterfaceSchema.definitions.StorageItemDBInterface
      .required;

  const properties = Object.keys(getProperties());

  return required.filter((r) => properties.includes(r));
};

export const schema: JSONSchema7 = {
  properties: {
    ...getProperties(),
  },
  required: getRequired(),
};
