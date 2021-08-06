import React from "react";
// import { ClientInterface } from "../../server";
import io, { Socket } from "socket.io-client";
import { ETDHistoryInterface } from "../../server";
import moment from "moment";
import * as Realm from "realm-web";

interface ETDInterface {
  clients: any[];
  history: any | undefined;
  isLoadingDetail: boolean;
  detail: any | undefined;
  fetchDetail(id: string): void;
}

//@ts-ignore
export const ETDContext = React.createContext<ETDInterface>({});

let socket: Socket | undefined = undefined;

export default function ETDProvider(props: any) {
  const { children } = props;
  const [clients, setClients] = React.useState<any[]>([]);
  const [history, setHistory] = React.useState<ETDHistoryInterface>({
    difficultyHistory: [
      { difficulty: 10, time: moment() },
      { difficulty: 10, time: moment() },
    ],
    lastBlockAt: undefined,
    latestAvgBlockTime: 0,
    latestBlockNumber: 0,
    latestDifficulty: 0,
    blockTimeHistory: [
      { blockTime: 3, blockNumber: 1, avgBlockTime: 3, time: moment() },
      { blockTime: 3, blockNumber: 2, avgBlockTime: 3, time: moment() },
      { blockTime: 3, blockNumber: 3, avgBlockTime: 3, time: moment() },
    ],
  });
  const [detail, setDetail] = React.useState<any>();
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  React.useEffect(() => {
    // socket = io("/clients");
    //
    // socket.off("realtime-info");
    // socket.off("history");
    //
    // socket.on("detail-info", (detail: any) => {
    //   if (detail !== undefined) {
    //     console.log("Get details", detail);
    //     setDetail(detail);
    //   }
    //   setIsLoadingDetail(false);
    // });
    //
    // socket.on("realtime-info", (data: any[]) => {
    //   setClients(data);
    // });
    //
    // socket.on("history", (data: ETDHistoryInterface) => {
    //   setHistory(data);
    // });
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
  };

  return <ETDContext.Provider value={value}>{children}</ETDContext.Provider>;
}
