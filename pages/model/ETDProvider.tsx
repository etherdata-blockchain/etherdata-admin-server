import React from "react";
// import { ClientInterface } from "../../server";
import io, { Socket } from "socket.io-client";
import { ETDHistoryInterface } from "../../server";
import { realmApp } from "../_app";
import { TransactionSummary } from "../../server/interfaces/transaction";
import { UIProviderContext } from "./UIProvider";
import { Environments } from "../../internal/const/environments";

interface ETDInterface {
  clients: any[];
  history: ETDHistoryInterface | undefined;
  isLoadingDetail: boolean;
  detail: any | undefined;
  transactions: TransactionSummary[];

  fetchDetail(id: string): void;
}

// @ts-ignore
export const ETDContext = React.createContext<ETDInterface>({});

let socket: Socket | undefined = undefined;

/**
 * Provider for fetching etd data
 * @param props
 * @constructor
 */
export default function ETDProvider(props: any) {
  const { children } = props;
  // eslint-disable-next-line no-unused-vars
  const [clients, setClients] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<TransactionSummary[]>(
    []
  );
  const [history, setHistory] = React.useState<ETDHistoryInterface>();
  // eslint-disable-next-line no-unused-vars
  const [detail, setDetail] = React.useState<any>();
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);

  React.useEffect(() => {
    const url =
      Environments.ClientSideEnvironments.NEXT_PUBLIC_STATS_SERVER + "/clients";
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
          const tx = await transactionCol.aggregate([
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