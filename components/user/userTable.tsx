// @flow
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/dist/client/router";
import { Button } from "@mui/material";
import { PaginatedStorageUsers } from "../../server/plugin/plugins/storageManagementSystemPlugin";
import { Configurations } from "../../server/const/configurations";

type Props = {
  storageUser: PaginatedStorageUsers;
  handlePageChange(number: number): Promise<void>;
  currentPage: number;
};

export function UserTable({
  storageUser,
  handlePageChange,
  currentPage,
}: Props) {
  const { totalUsers, totalPage, users } = storageUser;
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 3 },
    { field: "user_name", headerName: "User Name", flex: 3 },
    { field: "coinbase", headerName: "Coinbase", flex: 5 },
    {
      field: "detail",
      headerName: "Detail",
      flex: 2,
      renderCell: (params) => {
        const user = users.find((u) => u.id === params.value);
        return (
          <Button
            onClick={() =>
              router.push(`/user/${params.value}?coinbase=${user?.coinbase}`)
            }
          >
            Details
          </Button>
        );
      },
    },
  ];

  const rows = users.map((u) => {
    return {
      id: u.id,
      detail: u.id,
      user_name: u.user_name,
      coinbase: u.coinbase,
    };
  });

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      autoHeight
      disableSelectionOnClick
      paginationMode={"server"}
      page={currentPage}
      rowCount={totalUsers}
      pageSize={Configurations.numberPerPage}
      onPageChange={async (page) => {
        await handlePageChange(page);
      }}
    />
  );
}
