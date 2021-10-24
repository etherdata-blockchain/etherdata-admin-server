// @flow
import * as React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

type Props = {
  selections: string[];
  onChange(v: string): void;
};

export function PanelSelector({ selections, onChange }: Props) {
  const [selection, setSelection] = React.useState(selections[0]);

  React.useEffect(() => {
    setSelection(selections[0]);
  }, [selections]);

  return (
    <ToggleButtonGroup
      value={selection}
      exclusive
      onChange={(e, v) => {
        onChange(v);
        setSelection(v);
      }}
    >
      {selections.map((s) => (
        <ToggleButton key={s} value={s}>
          {s}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
