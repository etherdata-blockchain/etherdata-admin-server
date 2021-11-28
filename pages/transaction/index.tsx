// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";

import { TransactionTable } from "../../components/transaction/transactionTable";
import Spacer from "../../components/Spacer";
import { SendTransactionBtn } from "../../components/transaction/sendTransactionBtn";
import { GetServerSideProps } from "next";
import { TransactionDBPlugin } from "../../services/dbServices/transactionPlugin";
import { ITransaction } from "../../services/dbSchema/transaction";

type Props = {
  transactions: ITransaction[];
};

/**
 * Transaction page
 * @param transactions
 * @constructor
 */
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
  const transactions = await plugin.list(0, 20);
  return {
    props: {
      transactions: JSON.parse(JSON.stringify(transactions)),
    },
  };
};
