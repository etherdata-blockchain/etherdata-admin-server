// @flow
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Pagination } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import moment from "moment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Spacer from "../Spacer";
import { Configurations } from "../../internal/const/configurations";
import { StorageItemWithStatus } from "../../internal/const/common_interfaces";

type Props = {
  devices?: StorageItemWithStatus[];
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
  const [totalPage, setTotalPage] = React.useState(totalPageNumber);

  React.useEffect(() => {
    if (totalPageNumber > 0) {
      setTotalPage(totalPageNumber);
    }
  }, [totalPageNumber]);

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
        return (
          <Button
            onClick={() =>
              router.push(
                `/user/devices/detail/${devices![params.value].qr_code}`
              )
            }
          >
            Details
          </Button>
        );
      },
    },
  ];
  const data = devices?.map((d, index) => {
    return {
      id: index,
      deviceId: d.qr_code,
      online: d.status?.lastSeen
        ? Math.abs(moment(d.status?.lastSeen).diff(moment(), "seconds")) <
          Configurations.maximumNotSeenDuration
        : false,
      blockNumber: d.status?.data?.number,
      name: d.name,
      peerCount: d.status?.data?.systemInfo.peerCount,
      difficulty: d.status?.data?.difficulty,
      nodeInfo: d.status?.data?.systemInfo.nodeVersion,
      adminVersion: d.status?.adminVersion,
      detail: index,
    };
  });

  return (
    <div style={{ width: "100%" }}>
      <Pagination
        color={"primary"}
        onChange={async (e, cur) => {
          await onPageChanged(cur);
        }}
        count={totalPage}
        page={currentPageNumber}
      />
      <Spacer height={10} />
      <DataGrid
        style={{ width: "100%" }}
        loading={loading}
        columns={columns}
        rows={data ?? []}
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
