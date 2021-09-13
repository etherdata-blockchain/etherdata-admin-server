// @flow
import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { useRouter } from "next/dist/client/router";
import { IDevice } from "../../server/schema/device";
import { ClientInterface } from "../../server/client/nodeClient";

type Props = {
  devices: ClientInterface[];
  loading?: boolean;
  currentPageNumber: number;
  totalPageNumber: number;
  totalNumRows: number;
  numPerPage: number;
  onPageChanged(num: number): void;
};

export function DeviceTable({
  devices,
  loading,
  currentPageNumber,
  totalPageNumber,
  onPageChanged,
  totalNumRows,
  numPerPage,
}: Props) {
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: "id", headerName: "Socket ID", width: 200 },
    { field: "name", headerName: "Device Name", width: 200 },
    { field: "deviceId", headerName: "Device ID", width: 200 },
    { field: "nodeInfo", headerName: "Node Info", width: 400 },
    { field: "blockNumber", headerName: "#Blocks", width: 200 },
    { field: "peerCount", headerName: "Peer Count", width: 200 },
    { field: "difficulty", headerName: "Difficulty", width: 200 },
    {
      field: "detail",
      headerName: "Detail",
      width: 200,
      renderCell: (params) => {
        const device = devices.find((d) => d.id === params.id)!;
        return (
          <Button
            onClick={() =>
              router.push(`/device/${device.data?.systemInfo.nodeId}`)
            }
          >
            Details
          </Button>
        );
      },
    },
  ];
  const data = devices.map((d) => {
    return {
      id: d.id,
      deviceId: d.data?.systemInfo.nodeId,
      blockNumber: d.data?.blockNumber,
      name: d.data?.systemInfo.name,
      peerCount: d.data?.systemInfo.peerCount,
      difficulty: d.data?.difficulty,
      nodeInfo: d.data?.systemInfo.nodeVersion,
    };
  });

  return (
    <DataGrid
      loading={loading}
      columns={columns}
      rows={data}
      paginationMode={"server"}
      rowCount={totalNumRows}
      onPageChange={async (page) => {
        await onPageChanged(page.page);
      }}
      autoHeight
      pageSize={numPerPage}
      disableSelectionOnClick
      pagination
      page={currentPageNumber}
    />
  );
}
