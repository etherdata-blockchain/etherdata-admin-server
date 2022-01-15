// @flow
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/dist/client/router";
import { Button } from "@mui/material";
import { DefaultStorageUser } from "../../internal/const/defaultValues";
import qs from "query-string";
import { PaginationResult } from "../../internal/const/common_interfaces";
import { IStorageOwner } from "../../internal/services/dbSchema/device/storage/owner";

type Props = {
  storageUser: PaginationResult<IStorageOwner>;
  handlePageChange(number: number): Promise<void>;
  currentPage: number;
};

/**
 * Show user
 * @param {PaginationResult} storageUser data to be shown
 * @param {function} handlePageChange Go to next page
 * @param {number}currentPage Current page number
 * @constructor
 */
export function UserTable({
  storageUser,
  handlePageChange,
  currentPage,
}: Props) {
  const { results, count, pageSize } = storageUser;
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 3 },
    { field: "user_name", headerName: "User Name", flex: 3 },
    { field: "coinbase", headerName: "Coinbase", flex: 5 },
    { field: "numDevices", headerName: "Online / Total", flex: 3 },
    {
      field: "detail",
      headerName: "Detail",
      flex: 2,
      renderCell: (params) => {
        const user = results.find((u) => u.user_id === params.value);
        return (
          <Button
            onClick={async () => {
              if (params.value === DefaultStorageUser.user_id) {
                const query = qs.stringify({ name: user?.user_name });
                await router.push(`/user/${params.value}?${query}`);
              } else {
                const query = qs.stringify({
                  name: user?.user_name,
                  coinbase: user?.coinbase,
                });
                await router.push(`/user/${params.value}?${query}`);
              }
            }}
          >
            Details
          </Button>
        );
      },
    },
  ];

  const rows = results.map((u, index) => {
    return {
      id: index,
      detail: u.user_id,
      user_name: u.user_name,
      coinbase: u.coinbase,
      numDevices: `${u.onlineCount}/${u.totalCount}`,
    };
  });

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      autoHeight
      disableSelectionOnClick
      paginationMode={"server"}
      page={currentPage - 1}
      rowCount={count}
      pageSize={pageSize}
      onPageChange={async (page) => {
        await handlePageChange(page + 1);
      }}
    />
  );
}
