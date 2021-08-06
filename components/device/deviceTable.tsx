// @flow
import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { useRouter } from "next/dist/client/router";

type Props = {};

export function DeviceTable(props: Props) {
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: "id", headerName: "Device ID", width: 200 },
    { field: "node_info", headerName: "Node Info", width: 200 },
    { field: "num_block", headerName: "#Blocks", width: 200 },
    { field: "peer_count", headerName: "Peer Count", width: 200 },
    {
      field: "detail",
      headerName: "Detail",
      width: 200,
      renderCell: (params) => {
        return (
          <Button onClick={() => router.push(`/device/${params.value}`)}>
            Details
          </Button>
        );
      },
    },
  ];

  const rows = [{ id: 1, time: "abc", amount: 200, detail: 1 }];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      autoHeight
      disableSelectionOnClick
    />
  );
}
