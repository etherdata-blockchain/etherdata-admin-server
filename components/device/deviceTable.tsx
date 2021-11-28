// @flow
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Pagination } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { IDevice } from "../../server/schema/device";
import moment from "moment";
import { CONFIG } from "../../server/config/config";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Spacer from "../Spacer";

type Props = {
  devices: IDevice[];
  loading?: boolean;
  currentPageNumber: number;
  totalPageNumber: number;
  totalNumRows: number;
  numPerPage: number;
  onPageChanged(num: number): void;
};

// eslint-disable-next-line require-jsdoc
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
    {
      field: "online",
      headerName: "Is Online",
      width: 160,
      renderCell: (params) => {
        return (
          <div>
            {params.value === true ? (
              <CheckCircleOutlineIcon style={{ color: "green" }} />
            ) : (
              <HighlightOffIcon style={{ color: "red" }} />
            )}
          </div>
        );
      },
    },
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
          <Button
            onClick={() => router.push(`/user/devices/detail/${device.id}`)}
          >
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
      online: d.lastSeen
        ? Math.abs(moment(d.lastSeen).diff(moment(), "seconds")) <
          CONFIG.maximumNotSeenDuration
        : false,
      blockNumber: d.data?.number,
      name: d.name,
      peerCount: d.data?.systemInfo.peerCount,
      difficulty: d.data?.difficulty,
      nodeInfo: d.data?.systemInfo.nodeVersion,
      adminVersion: d.adminVersion,
    };
  });

  return (
    <div style={{ width: "100%" }}>
      <Pagination
        color={"primary"}
        onChange={async (e, cur) => {
          await onPageChanged(cur - 1);
        }}
        count={totalPageNumber}
        page={currentPageNumber + 1}
      />
      <Spacer height={10} />
      <DataGrid
        style={{ width: "100%" }}
        loading={loading}
        columns={columns}
        rows={data}
        paginationMode={"server"}
        rowCount={totalNumRows}
        onPageChange={async (page) => {
          await onPageChanged(page);
        }}
        autoHeight
        pageSize={numPerPage}
        disableSelectionOnClick
        pagination
        page={currentPageNumber}
      />
    </div>
  );
}
