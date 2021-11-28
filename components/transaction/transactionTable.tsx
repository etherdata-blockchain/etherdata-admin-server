// @flow
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ITransaction } from "../../server/schema/transaction";
import ResponsiveCard from "../ResponsiveCard";
import styles from "../../styles/Transactions.module.css";

type Props = {
  transactions: ITransaction[];
};

// eslint-disable-next-line require-jsdoc
export function TransactionTable({ transactions }: Props) {
  console.log(transactions);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Transaction ID", width: 200 },
    { field: "time", headerName: "Time", width: 200 },
    { field: "from", headerName: "From", width: 200 },
    { field: "to", headerName: "To", width: 200 },
    { field: "value", headerName: "Value", width: 200 },
  ];

  const rows = transactions.map((t) => {
    return { id: t.hash, ...t };
  });

  return (
    <ResponsiveCard className={styles.transactionTable}>
      <DataGrid columns={columns} rows={rows} />
    </ResponsiveCard>
  );
}
