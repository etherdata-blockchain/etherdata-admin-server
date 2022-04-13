// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import Spacer from "../../components/common/Spacer";
import { UserTable } from "../../components/user/userTable";
import ResponsiveCard from "../../components/common/ResponsiveCard";
import { AddUserBtn } from "../../components/user/addUserBtn";
import { GetServerSideProps } from "next";
import { Divider, Pagination } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { PaddingBox } from "../../components/common/PaddingBox";
import { interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { DeviceIdSearchField } from "../../components/user/deviceIdSearchField";

type Props = {
  paginationResult: interfaces.PaginationResult<schema.IStorageOwner>;
  currentPage: number;
};

// eslint-disable-next-line require-jsdoc
export default function User({ paginationResult, currentPage }: Props) {
  const { totalPage } = paginationResult;
  const router = useRouter();

  const handlePageChange = React.useCallback(async (page: number) => {
    await router?.push("/user?page=" + page);
  }, []);

  return (
    <div>
      <Spacer height={20} />
      <PageHeader
        title={"User"}
        description={"users"}
        action={<AddUserBtn />}
      />
      <Spacer height={20} />
      <PaddingBox>
        <ResponsiveCard title={"tables"} action={<DeviceIdSearchField />}>
          <Pagination
            data-testid={"pagination"}
            color={"primary"}
            onChange={async (e, cur) => {
              await handlePageChange(cur);
            }}
            count={totalPage}
            page={currentPage}
          />
          <Spacer height={10} />
          <Divider />
          <Spacer height={10} />
          <UserTable
            storageUser={paginationResult}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </ResponsiveCard>
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const currentPage = parseInt((context.query.page as string) ?? "1");
  const storageManagementOwnerService =
    new dbServices.StorageManagementOwnerService();
  const users = await storageManagementOwnerService.getListOfUsers(currentPage);

  return {
    props: {
      paginationResult: JSON.parse(JSON.stringify(users)),
      currentPage,
    },
  };
};
