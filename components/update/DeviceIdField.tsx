import Box from "@mui/material/Box";
import { Form as BForm } from "react-bootstrap";
import * as React from "react";
import { DeviceIdsAutoComplete } from "./DeviceIdsAutoComplete";
import { ArrayFieldTemplateProps } from "@rjsf/core";
import { sleep } from "../../internal/utils/sleep";
import { Configurations } from "../../internal/const/configurations";

// eslint-disable-next-line require-jsdoc
export function DeviceIdField(props: ArrayFieldTemplateProps) {
  //TODO: Use auto complete field in the future. Dynamically fetch image with tag
  const { title, items, formData, onAddClick } = props;
  const [shouldAdd, setShouldAdd] = React.useState(false);
  const [newContent, setNewContent] = React.useState<string>();
  const [newIndex, setNewIndex] = React.useState<number>();

  React.useEffect(() => {
    if (shouldAdd) {
      const item = items[newIndex!];
      const children = item.children;
      children.props.onChange(newContent);
      setNewIndex(undefined);
      setNewContent(undefined);
      setShouldAdd(false);
    }
  }, [shouldAdd]);

  const onAdd = React.useCallback(async (index: number, content: string) => {
    setNewContent(content);
    setNewIndex(index);
    onAddClick();
    await sleep(Configurations.defaultSleepDuration);
    setShouldAdd(true);
  }, []);

  const onDelete = React.useCallback(
    async (index) => {
      const item = items[index];
      item.onDropIndexClick(index)();
    },
    [items]
  );

  return (
    <Box>
      <BForm.Label>{title}</BForm.Label>
      <DeviceIdsAutoComplete
        id={title}
        defaultValues={formData}
        onAdd={onAdd}
        onDelete={onDelete}
        label={title}
        placeholder={title}
      />
    </Box>
  );
}
