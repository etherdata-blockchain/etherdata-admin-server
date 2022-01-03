import Box from "@mui/material/Box";
import { Form as BForm } from "react-bootstrap";
import * as React from "react";
import { DeviceIdsAutoComplete } from "./DeviceIdsAutoComplete";

// eslint-disable-next-line require-jsdoc
export function DeviceIdField(props: any) {
  //TODO: Use auto complete field in the future. Dynamically fetch image with tag
  const { label, id, onChange, placeholder, value } = props;
  return (
    <Box>
      <BForm.Label>{label}</BForm.Label>
      <DeviceIdsAutoComplete
        id={id}
        defaultValues={value}
        onChange={(v) => onChange(v)}
        label={label}
        placeholder={placeholder}
      />
    </Box>
  );
}
