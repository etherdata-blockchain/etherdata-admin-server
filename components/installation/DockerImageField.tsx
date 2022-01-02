import Box from "@mui/material/Box";
import { Form as BForm } from "react-bootstrap";
import { DockerImageAutocompleteTextField } from "./DockerImageAutocompleteTextField";
import * as React from "react";

// eslint-disable-next-line require-jsdoc
export function ImageField(props: any) {
  //TODO: Use auto complete field in the future. Dynamically fetch image with tag
  const { label, id, onChange, placeholder, options, value } = props;
  return (
    <Box>
      <BForm.Label>{label}</BForm.Label>
      <DockerImageAutocompleteTextField
        id={id}
        defaultValues={options.images}
        label={label}
        placeholder={placeholder}
        selection={value}
        onChange={(v) => {
          console.log(v.tags[0]._id);
          onChange(v.tags[0]._id);
        }}
      />
    </Box>
  );
}
