// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { Button } from "@material-ui/core";
import styles from "../../styles/Transactions.module.css";
import { TransactionTable } from "../../components/transaction/transactionTable";
import ResponsiveCard from "../../components/ResponsiveCard";
import Spacer from "../../components/Spacer";
import { SendTransactionBtn } from "../../components/transaction/sendTransactionBtn";

type Props = {};

export default function Transaction(props: Props) {
  return (
    <div>
      <PageHeader
        title={"Transaction"}
        description={"Transaction Details"}
        action={<SendTransactionBtn />}
      />
      <Spacer height={20} />
      <ResponsiveCard className={styles.transactionTable}>
        <TransactionTable />
      </ResponsiveCard>
    </div>
  );
}
