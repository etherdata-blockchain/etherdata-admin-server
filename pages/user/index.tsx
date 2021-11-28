// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import { UserTable } from "../../components/user/userTable";
import ResponsiveCard from "../../components/ResponsiveCard";
import { AddUserBtn } from "../../components/user/addUserBtn";
import { GetServerSideProps } from "next";
import {
  PaginatedStorageUsers,
  StorageManagementSystemPlugin,
} from "../../server/plugin/plugins/storageManagementSystemPlugin";
import { Pagination } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { TestingValues } from "../../server/const/testingValues";

type Props = {
  paginationResult: PaginatedStorageUsers;
  currentPage: number;
};

// eslint-disable-next-line require-jsdoc
export default function User({ paginationResult, currentPage }: Props) {
  const { totalPage } = paginationResult;
  const router = useRouter();

  const handlePageChange = React.useCallback(async (page: number) => {
    await router.push("/user?page=" + page);
  }, []);

  return (
    <div>
      <PageHeader
        title={"User"}
        description={"users"}
        action={<AddUserBtn />}
      />
      <Spacer height={20} />
      <ResponsiveCard>
        <Pagination
          data-testid={TestingValues.pagination}
          color={"primary"}
          onChange={async (e, cur) => {
            await handlePageChange(cur - 1);
          }}
          count={totalPage}
          page={currentPage + 1}
        />
        <Spacer height={10} />
        <UserTable
          storageUser={paginationResult}
          handlePageChange={handlePageChange}
          currentPage={currentPage}
        />
      </ResponsiveCard>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const currentPage = parseInt((context.query.page as string) ?? "0");
  const plugin = new StorageManagementSystemPlugin();
  const users = await plugin.getUsers(currentPage);

  return {
    props: {
      paginationResult: JSON.parse(JSON.stringify(users)),
      currentPage,
    },
  };
};
