import React from "react";
// import { ClientInterface } from "../../server";
import io, { Socket } from "socket.io-client";
import { ETDHistoryInterface } from "../../server";

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
  const [history, setHistory] = React.useState<ETDHistoryInterface>();
  const [detail, setDetail] = React.useState<any>();
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  React.useEffect(() => {
    socket = io("/clients");

    socket.off("realtime-info");
    socket.off("history");

    socket.on("detail-info", (detail: any) => {
      if (detail !== undefined) {
        console.log("Get details", detail);
        setDetail(detail);
      }
      setIsLoadingDetail(false);
    });

    socket.on("realtime-info", (data: any[]) => {
      setClients(data);
    });

    socket.on("history", (data: ETDHistoryInterface) => {
      setHistory(data);
    });
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
