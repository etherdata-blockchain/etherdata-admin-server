// @flow
import * as React from "react";
import {
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ETDContext } from "../../pages/model/ETDProvider";

type Props = {};

/**
 * List of transactions
 * @param props
 * @constructor
 */
export function TransactionDisplay(props: Props) {
  const { transactions } = React.useContext(ETDContext);

  return (
    <List style={{ height: "80%", overflowY: "scroll" }}>
      {transactions.map((t, i) => (
        <div key={`transaction-${i}`}>
          <ListItemButton>
            <ListItemAvatar>{i + 1}</ListItemAvatar>
            <ListItemText
              primary={<Typography noWrap>{t.hash}</Typography>}
              secondary={<Typography noWrap={true}>{t.value}</Typography>}
            />
          </ListItemButton>
          <Divider />
        </div>
      ))}
    </List>
  );
}
