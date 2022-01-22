import React from "react";
import io, { Socket } from "socket.io-client";
import { UIProviderContext } from "./UIProvider";
import { ObjectId } from "bson";
import { RealtimeStatus } from "../../internal/const/common_interfaces";
import { DefaultRealtimeStatus } from "../../internal/const/defaultValues";
import { configs, enums, utils } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";

interface DeviceInterface {
  realtimeStatus: RealtimeStatus;

  sendDockerCommand(v: enums.DockerValueType): Promise<any>;

  joinDetail(deviceId: string): void;

  leaveDetail(deviceId: string): void;

  sendCommand(methodName: string, params: any[]): Promise<any>;
}

// @ts-ignore
export const DeviceContext = React.createContext<DeviceInterface>({});

export let socket: Socket | undefined = undefined;

/**
 * Device provider for using devices
 * @param props
 * @constructor
 */
export default function DeviceProvider(props: any) {
  const { children } = props;
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [realtimeStatus, setRealtimeStatus] = React.useState<RealtimeStatus>(
    DefaultRealtimeStatus
  );

  React.useEffect(() => {
    socket = io("/clients", {
      auth: {
        token:
          configs.Environments.ClientSideEnvironments
            .NEXT_PUBLIC_CLIENT_PASSWORD,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      showSnackBarMessage("Connected to admin socket server");
    });

    socket.on(
      enums.SocketIOEvents.latestInfo,
      ({ onlineCount, totalCount }) => {
        console.log(onlineCount);
        setRealtimeStatus((status) => {
          status.onlineCount = onlineCount;
          status.totalCount = totalCount;
          return JSON.parse(JSON.stringify(status));
        });
      }
    );

    socket.on(enums.SocketIOEvents.pendingJob, (data: number) => {
      setRealtimeStatus((status) => {
        status.pendingJobNumber = data;
        return JSON.parse(JSON.stringify(status));
      });
    });
  }, []);

  const joinDetail = React.useCallback((deviceId: string) => {
    console.log("Joining room");
    socket?.emit(enums.SocketIOEvents.joinRoom, deviceId);
  }, []);

  const leaveDetail = React.useCallback((deviceId: string) => {
    socket?.emit(enums.SocketIOEvents.leaveRoom, deviceId);
  }, []);

  const sendCommand = React.useCallback(
    async (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        const uuid = new ObjectId().toString();
        console.log(`Waiting for ${uuid}'s result`);
        socket?.emit(enums.SocketIOEvents.rpcCommand, { method, params }, uuid);
        socket?.once(`${enums.SocketIOEvents.rpcResult}-${uuid}`, (data) => {
          resolve(data);
          socket?.off(`${enums.SocketIOEvents.rpcError}-${uuid}`);
        });
        socket?.once(`${enums.SocketIOEvents.rpcError}-${uuid}`, (data) => {
          reject(data);
          socket?.off(`${enums.SocketIOEvents.rpcResult}-${uuid}`);
        });
      });
    },
    [socket]
  );

  const sendDockerCommand = React.useCallback(
    (value: enums.DockerValueType) => {
      return new Promise((resolve, reject) => {
        const uuid = new ObjectId().toString();
        socket?.emit(enums.SocketIOEvents.dockerCommand, value, uuid);
        socket?.once(
          `${enums.SocketIOEvents.dockerResult}-${uuid}`,
          (value) => {
            resolve(value);
            socket?.off(`${enums.SocketIOEvents.dockerResult}t-${uuid}`);
            socket?.off(`${enums.SocketIOEvents.dockerError}-${uuid}`);
          }
        );

        socket?.once(`${enums.SocketIOEvents.dockerError}-${uuid}`, (value) => {
          reject(value);
          socket?.off(`${enums.SocketIOEvents.dockerResult}-${uuid}`);
          socket?.off(`${enums.SocketIOEvents.dockerError}-${uuid}`);
        });
      });
    },
    [socket]
  );

  const value: DeviceInterface = {
    joinDetail,
    leaveDetail,
    sendCommand,
    sendDockerCommand,
    realtimeStatus,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
