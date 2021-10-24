// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { Button } from "@mui/material";

import { TransactionTable } from "../../components/transaction/transactionTable";
import ResponsiveCard from "../../components/ResponsiveCard";
import Spacer from "../../components/Spacer";
import { SendTransactionBtn } from "../../components/transaction/sendTransactionBtn";
import { GetServerSideProps } from "next";
import { DeviceRegistrationPlugin } from "../../server/plugin/plugins/deviceRegistrationPlugin";
import { TransactionDBPlugin } from "../../server/plugin/plugins/transactionPlugin";
import { ITransaction } from "../../server/schema/transaction";

type Props = {
  transactions: ITransaction[];
};

export default function Transaction({ transactions }: Props) {
  return (
    <div>
      <PageHeader
        title={"Transaction"}
        description={"Transaction Details"}
        action={<SendTransactionBtn />}
      />
      <Spacer height={20} />

      <TransactionTable transactions={transactions} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const plugin = new TransactionDBPlugin();
  let transactions = await plugin.list(0, 20);
  return {
    props: {
      transactions: JSON.parse(JSON.stringify(transactions)),
    },
  };
};
