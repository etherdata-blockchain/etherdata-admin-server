import Box from "@mui/material/Box";
import { Form as BForm } from "react-bootstrap";
import { DockerImageAutocompleteTextField } from "./DockerImageAutocompleteTextField";
import * as React from "react";
import { sleep } from "../../internal/utils/sleep";

// eslint-disable-next-line require-jsdoc
export function ImageField(props: any) {
  const { title, properties, formData } = props;

  const onChange = React.useCallback(
    async (v: { image: string; tag: string }) => {
      const image = properties[0].content;
      const tag = properties[1].content;

      const onImageChange = image.props.onChange;
      const onTagChange = tag.props.onChange;

      onImageChange(v.image);
      await sleep(100);
      onTagChange(v.tag);
    },
    []
  );

  return (
    <Box>
      <BForm.Label>{title}</BForm.Label>
      <DockerImageAutocompleteTextField
        id={"image"}
        label={title}
        placeholder={title}
        selection={formData}
        onChange={(v) => {
          const obj = { image: v._id, tag: v.tags[0]._id };
          onChange(obj);
        }}
      />
    </Box>
  );
}
