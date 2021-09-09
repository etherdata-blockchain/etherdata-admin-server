import React from "react";
// import { ClientInterface } from "../../server";
import io, { Socket } from "socket.io-client";
import { ETDHistoryInterface } from "../../server";
import moment from "moment";
import * as Realm from "realm-web";
import { realmApp } from "../_app";
import { TransactionSummary } from "../../server/interfaces/transaction";
import { set } from "mongoose";
import { UIProviderContext } from "./UIProvider";

interface ETDInterface {
  clients: any[];
  history: ETDHistoryInterface | undefined;
  isLoadingDetail: boolean;
  detail: any | undefined;
  transactions: TransactionSummary[];
  fetchDetail(id: string): void;
}

//@ts-ignore
export const ETDContext = React.createContext<ETDInterface>({});

let socket: Socket | undefined = undefined;

export default function ETDProvider(props: any) {
  const { children } = props;
  const [clients, setClients] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<TransactionSummary[]>(
    []
  );
  const [history, setHistory] = React.useState<ETDHistoryInterface>();
  const [detail, setDetail] = React.useState<any>();
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);

  React.useEffect(() => {
    let url = process.env.NEXT_PUBLIC_STATS_SERVER + "/clients";
    showSnackBarMessage("Loading Data");
    console.log(url);
    socket = io(url);
    socket.off("history");
    socket.on("history", (data: ETDHistoryInterface) => {
      setHistory(data);
    });

    const mongodb = realmApp.currentUser?.mongoClient("mongodb-atlas");
    const transactionCol = mongodb?.db("etd").collection("transactions");
    if (transactionCol) {
      transactionCol
        .count()
        .then(async (count) => {
          let tx = await transactionCol.aggregate([
            {
              $skip: count - 20,
            },
            {
              $limit: 20,
            },
          ]);

          setTransactions(tx);
        })
        .catch((err) => showSnackBarMessage(err.toString()));
    }
  }, []);

  const fetchDetail = React.useCallback((id: string) => {
    socket?.emit("details", id);
    setIsLoadingDetail(true);
  }, []);

  const value: ETDInterface = {
    clients,
    history,
    fetchDetail,
    detail,
    isLoadingDetail,
    transactions,
  };

  return <ETDContext.Provider value={value}>{children}</ETDContext.Provider>;
}
