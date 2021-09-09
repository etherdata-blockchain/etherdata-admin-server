import React from "react";
import io, { Socket } from "socket.io-client";
import { ETDHistoryInterface } from "../../server";
import { TransactionSummary } from "../../server/interfaces/transaction";
import { UIProviderContext } from "./UIProvider";
import { realmApp } from "../_app";
import { IDevice } from "../../server/schema/device";
import { Web3DataInfo } from "../../server/client/node_data";

interface DeviceInterface {
  loadingData: boolean;
  devices: IDevice[];
  filterKeyword: string;
  setFilterKeyword(v: string): void;
  joinDetail(deviceId: string): void;
  leaveDetail(deviceId: string): void;
  sendCommand(methodName: string, params: any[]): Promise<any>;
}

//@ts-ignore
export const DeviceContext = React.createContext<DeviceInterface>({});

let socket: Socket | undefined = undefined;

export default function DeviceProvider(props: any) {
  const { children } = props;
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [devices, setDevices] = React.useState<IDevice[]>([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [filterKeyword, setFilterKeyword] = React.useState<string>("");

  React.useEffect(() => {
    socket = io("/clients", {
      auth: { token: process.env.NEXT_PUBLIC_CLIENT_PASSWORD },
    });

    socket.on("connect", () => {
      showSnackBarMessage("Connected to admin socket server");
    });

    socket.on(
      "realtime-info",
      ({ type, data }: { type: string; data: any }) => {
        switch (type) {
          case "init": {
            setDevices(data);
            break;
          }

          case "insert": {
            setDevices((devices) => {
              let oldDevices = JSON.parse(JSON.stringify(devices));
              oldDevices.push(data);
              return oldDevices;
            });
            break;
          }

          case "update": {
            setDevices((devices) => {
              let oldDevices = JSON.parse(JSON.stringify(devices));
              let found = devices.findIndex((d) => d.id === data.id);
              if (found > -1) {
                oldDevices[found] = data;
              }
              return oldDevices;
            });
            break;
          }

          case "delete": {
            setDevices((devices) => {
              let oldDevices = JSON.parse(JSON.stringify(devices));
              let foundIndex = devices.findIndex((d) => d.id === data.id);
              if (foundIndex > -1) {
                oldDevices.splice(foundIndex, 1);
              }
              return oldDevices;
            });
            break;
          }
        }
      }
    );
  }, []);

  const joinDetail = React.useCallback((deviceId: string) => {
    socket?.emit("join-room", deviceId);
  }, []);

  const leaveDetail = React.useCallback((deviceId: string) => {
    socket?.emit("leave-room", deviceId);
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
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
