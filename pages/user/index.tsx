// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import { UserTable } from "../../components/user/userTable";
import ResponsiveCard from "../../components/ResponsiveCard";
import { AddUserBtn } from "../../components/user/addUserBtn";

type Props = {};

export default function User(props: Props) {
  return (
    <div>
      <PageHeader
        title={"User"}
        description={"users"}
        action={<AddUserBtn />}
      />
      <Spacer height={20} />
      <ResponsiveCard>
        <UserTable />
      </ResponsiveCard>
    </div>
  );
}