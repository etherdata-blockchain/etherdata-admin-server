// @flow
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/dist/client/router";
import { Button } from "@mui/material";
<<<<<<< HEAD
import { PaginatedStorageUsers } from "../../services/dbServices/storageManagementSystemPlugin";
import { Configurations } from "../../server/const/configurations";
import { DefaultStorageUser } from "../../server/const/defaultValues";
=======
import { PaginatedStorageUsers } from "../../internal/services/dbServices/storage-management-system-plugin";
import { Configurations } from "../../internal/const/configurations";
import { DefaultStorageUser } from "../../internal/const/defaultValues";
>>>>>>> upstream/install-script
import queryString from "querystring";

type Props = {
  storageUser: PaginatedStorageUsers;
  handlePageChange(number: number): Promise<void>;
  currentPage: number;
};

/**
 * Show user
 * @param {PaginatedStorageUsers} storageUser data to be shown
 * @param {function} handlePageChange Go to next page
 * @param {number}currentPage Current page number
 * @constructor
 */
export function UserTable({
  storageUser,
  handlePageChange,
  currentPage,
}: Props) {
  const { totalUsers, users } = storageUser;
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
            onClick={async () => {
              if (params.value === DefaultStorageUser.id) {
                const query = queryString.stringify({ name: user?.user_id });
                await router.push(`/user/${params.value}?${query}`);
              } else {
                const query = queryString.stringify({
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
