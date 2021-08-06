// @flow
import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";

type Props = {};

export function TransactionTable(props: Props) {
  const columns: GridColDef[] = [
    { field: "id", headerName: "Transaction ID", width: 200 },
    { field: "time", headerName: "Time", width: 200 },
    { field: "amount", headerName: "Amount", width: 200 },
  ];

  const rows = [{ id: 1, time: "abc", amount: 200 }];

  return <DataGrid columns={columns} rows={rows} autoHeight />;
}
