// @flow
import * as React from "react";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useRouter } from "next/dist/client/router";
import { Button } from "@mui/material";

type Props = {};

export function UserTable(props: Props) {
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: "id", headerName: "User ID", width: 200 },
    { field: "deviceAmount", headerName: "Device Amount", width: 200 },
    {
      field: "detail",
      headerName: "Detail",
      width: 200,
      renderCell: (params) => {
        return (
          <Button onClick={() => router.push(`/user/${params.value}`)}>
            Details
          </Button>
        );
      },
    },
  ];

  const rows = [{ id: 1, deviceAmount: 200, detail: 1 }];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      autoHeight
      disableSelectionOnClick
    />
  );
}
