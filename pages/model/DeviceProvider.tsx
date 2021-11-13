import React from "react";
import io, { Socket } from "socket.io-client";
import { UIProviderContext } from "./UIProvider";
import {
  ClientFilter,
  PaginationResult,
} from "../../server/client/browserClient";
import { IDevice } from "../../server/schema/device";
import { ObjectId } from "bson";
import { VersionInfo } from "../../server/plugin/plugins/deviceRegistrationPlugin";

interface DockerValue {
  method: "logs" | "start" | "stop" | "remove" | "restart" | "exec";
  value: any;
}

interface DeviceInterface {
  loadingData: boolean;
  devices: IDevice[];
  currentPageNumber: number;
  totalPageNumber: number;
  totalNumDevices: number;
  totalNumOnlineDevices: number;
  filterKeyword: string;
  numPerPage: number;
  adminVersions: VersionInfo[];
  nodeVersions: VersionInfo[];
  currentFilter?: ClientFilter;

  setFilterKeyword(v: string): void;

  sendDockerCommand(v: DockerValue): Promise<any>;

  joinDetail(deviceId: string): void;

  leaveDetail(deviceId: string): void;

  sendCommand(methodName: string, params: any[]): Promise<any>;

  handlePageChange(pageNumber: number): Promise<any>;

  applyFilter(filter: ClientFilter): void;

  clearFilter(): void;
}

//@ts-ignore
export const DeviceContext = React.createContext<DeviceInterface>({});

export let socket: Socket | undefined = undefined;

export default function DeviceProvider(props: any) {
  const { children } = props;
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [devices, setDevices] = React.useState<IDevice[]>([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [filterKeyword, setFilterKeyword] = React.useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = React.useState(0);
  const [totalPageNumber, setTotalPageNumber] = React.useState(0);
  const [totalNumDevices, setTotalNumberDevices] = React.useState(0);
  const [totalNumOnlineDevices, setTotalOnlineDevices] = React.useState(0);
  const [adminVersions, setAdminVersions] = React.useState<VersionInfo[]>([]);
  const [nodeVersions, setNodeVersions] = React.useState<VersionInfo[]>([]);
  const [numPerPage, setNumPerPage] = React.useState(0);
  const [currentFilter, setCurrentFilter] = React.useState<ClientFilter>();

  React.useEffect(() => {
    socket = io("/clients", {
      auth: { token: process.env.NEXT_PUBLIC_CLIENT_PASSWORD },
      transports: ["websocket"],
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
        adminVersions,
        nodeVersions,
        clientFilter,
      }: PaginationResult) => {
        setCurrentFilter(clientFilter);
        setDevices(devices);
        setCurrentPageNumber(currentPageNumber);
        setTotalPageNumber(totalPageNumber);
        setTotalOnlineDevices(totalOnlineDevices);
        setTotalNumberDevices(totalNumberDevices);
        setNumPerPage(numPerPage);
        setAdminVersions(adminVersions);
        setNodeVersions(nodeVersions);
      }
    );
  }, []);

  const joinDetail = React.useCallback((deviceId: string) => {
    socket?.emit("join-room", deviceId);
  }, []);

  const leaveDetail = React.useCallback((deviceId: string) => {
    socket?.emit("leave-room", deviceId);
  }, []);

  const applyFilter = React.useCallback((filter: ClientFilter) => {
    socket?.emit("apply-filter", filter);
  }, []);

  const clearFilter = React.useCallback(() => {
    socket?.emit("apply-filter", undefined);
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
    async (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        const uuid = new ObjectId().toString();
        console.log(`Waiting for ${uuid}'s result`);
        socket?.emit("rpc-command", { method, params }, uuid);
        socket?.once(`rpc-result-${uuid}`, (data) => {
          resolve(data);
          socket?.off(`rpc-error-${uuid}`);
        });
        socket?.once(`rpc-error-${uuid}`, (data) => {
          reject(data);
          socket?.off(`rpc-result-${uuid}`);
        });
      });
    },
    [socket]
  );

  const sendDockerCommand = React.useCallback(
    (value: DockerValue) => {
      return new Promise((resolve, reject) => {
        console.log("Getting logs");
        const uuid = new ObjectId().toString();
        socket?.emit("docker-command", value, uuid);
        socket?.once(`docker-result-${uuid}`, (value) => {
          resolve(value);
          socket?.off(`docker-result-${uuid}`);
          socket?.off(`docker-error-${uuid}`);
        });

        socket?.once(`docker-error-${uuid}`, (value) => {
          reject(value);
          socket?.off(`docker-result-${uuid}`);
          socket?.off(`docker-error-${uuid}`);
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
    adminVersions,
    nodeVersions,
    currentFilter,
    applyFilter,
    clearFilter,
    sendDockerCommand,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
