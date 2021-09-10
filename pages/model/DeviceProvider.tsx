import React from "react";
import io, { Socket } from "socket.io-client";
import { ETDHistoryInterface } from "../../server";
import { TransactionSummary } from "../../server/interfaces/transaction";
import { UIProviderContext } from "./UIProvider";
import { realmApp } from "../_app";
import { IDevice } from "../../server/schema/device";
import { Web3DataInfo } from "../../server/client/node_data";
import { ClientInterface } from "../../server/client/nodeClient";
import { PaginationResult } from "../../server/client/browserClient";

interface DeviceInterface {
  loadingData: boolean;
  devices: ClientInterface[];
  currentPageNumber: number;
  totalPageNumber: number;
  totalNumDevices: number;
  totalNumOnlineDevices: number;
  filterKeyword: string;
  numPerPage: number;
  setFilterKeyword(v: string): void;
  joinDetail(deviceId: string): void;
  leaveDetail(deviceId: string): void;
  sendCommand(methodName: string, params: any[]): Promise<any>;
  handlePageChange(pageNumber: number): Promise<any>;
}

//@ts-ignore
export const DeviceContext = React.createContext<DeviceInterface>({});

let socket: Socket | undefined = undefined;

export default function DeviceProvider(props: any) {
  const { children } = props;
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [devices, setDevices] = React.useState<ClientInterface[]>([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [filterKeyword, setFilterKeyword] = React.useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = React.useState(0);
  const [totalPageNumber, setTotalPageNumber] = React.useState(0);
  const [totalNumDevices, setTotalNumberDevices] = React.useState(0);
  const [totalNumOnlineDevices, setTotalOnlineDevices] = React.useState(0);
  const [numPerPage, setNumPerPage] = React.useState(0);

  React.useEffect(() => {
    socket = io("wss://etd.admin.sirileepage.com/clients", {
      auth: { token: process.env.NEXT_PUBLIC_CLIENT_PASSWORD },
    });

    socket.on("connect", () => {
      showSnackBarMessage("Connected to admin socket server");
    });

    socket.on(
      "realtime-info",
      ({
        totalPageNumber,
        currentPageNumber,
        devices,
        totalNumberDevices,
        totalOnlineDevices,
        numPerPage,
      }: PaginationResult) => {
        setDevices(devices);
        setCurrentPageNumber(currentPageNumber);
        setTotalPageNumber(totalPageNumber);
        setTotalOnlineDevices(totalOnlineDevices);
        setTotalNumberDevices(totalNumberDevices);
        setNumPerPage(numPerPage);
      }
    );
  }, []);

  const joinDetail = React.useCallback((deviceId: string) => {
    socket?.emit("join-room", deviceId);
  }, []);

  const leaveDetail = React.useCallback((deviceId: string) => {
    socket?.emit("leave-room", deviceId);
  }, []);

  const handlePageChange = React.useCallback(async (pageNumber: number) => {
    return new Promise((resolve, reject) => {
      socket?.emit("page-change", pageNumber);
      socket?.once("page-changed", () => {
        setLoadingData(false);
        setCurrentPageNumber(pageNumber);
        resolve(true);
      });
      setLoadingData(true);
    });
  }, []);

  const sendCommand = React.useCallback(
    async (methodName: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        socket?.emit("rpc-command", { methodName, params });
        socket?.once("rpc-result", (data) => {
          console.log(data);
          resolve(data);
          socket?.off("rpc-command-error");
        });
        socket?.once("rpc-command-error", (data) => {
          console.log(data);
          reject(data);
          socket?.off("rpc-result");
        });
      });
    },
    [socket]
  );

  const value: DeviceInterface = {
    devices,
    filterKeyword,
    loadingData,
    setFilterKeyword,
    joinDetail,
    leaveDetail,
    sendCommand,
    currentPageNumber,
    totalPageNumber,
    handlePageChange,
    totalNumDevices,
    totalNumOnlineDevices,
    numPerPage,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
