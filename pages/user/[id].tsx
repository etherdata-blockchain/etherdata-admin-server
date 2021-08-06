// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";

type Props = {};

export default function UserDetail(props: Props) {
  return (
    <div>
      <PageHeader title={"User name"} description={""} />

      <Spacer height={20} />
    </div>
  );
}
