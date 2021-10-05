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
import moment from "moment";
import { CONFIG } from "../../server/config/config";

type Props = {
  devices: IDevice[];
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
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Device Name", width: 200 },
    { field: "online", headerName: "Is Online", width: 160 },
    { field: "deviceId", headerName: "Device ID", width: 200 },
    { field: "nodeInfo", headerName: "Node Info", width: 400 },
    { field: "blockNumber", headerName: "#Blocks", width: 200 },
    { field: "peerCount", headerName: "Peer Count", width: 200 },
    { field: "difficulty", headerName: "Difficulty", width: 200 },
    { field: "adminVersion", headerName: "AdminVersion", width: 200 },
    {
      field: "detail",
      headerName: "Detail",
      width: 200,
      renderCell: (params) => {
        const device = devices.find((d) => d._id === params.id)!;
        return (
          <Button onClick={() => router.push(`/device/${device.id}`)}>
            Details
          </Button>
        );
      },
    },
  ];
  const data = devices.map((d) => {
    return {
      id: d._id,
      deviceId: d.id,
      online:
        Math.abs(moment(d.lastSeen).diff(moment(), "seconds")) <
        CONFIG.maximumNotSeenDuration,
      blockNumber: d.data?.number,
      name: d.name,
      peerCount: d.data?.systemInfo.peerCount,
      difficulty: d.data?.difficulty,
      nodeInfo: d.data?.systemInfo.nodeVersion,
      adminVersion: d.adminVersion,
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
