import React from "react";
import io, { Socket } from "socket.io-client";
import { UIProviderContext } from "./UIProvider";

import { ObjectId } from "bson";
import { Environments } from "../../internal/const/environments";
import { RealtimeStatus } from "../../internal/const/common_interfaces";
import { DefaultRealtimeStatus } from "../../internal/const/defaultValues";
import { SocketIOEvents } from "../../internal/const/events";

interface DockerValue {
  method: "logs" | "start" | "stop" | "remove" | "restart" | "exec";
  value: any;
}

interface DeviceInterface {
  realtimeStatus: RealtimeStatus;
  sendDockerCommand(v: DockerValue): Promise<any>;

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
        token: Environments.ClientSideEnvironments.NEXT_PUBLIC_CLIENT_PASSWORD,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      showSnackBarMessage("Connected to admin socket server");
    });

    socket.on(SocketIOEvents.pendingJob, (data: number) => {
      console.log("Getting ", data);
      setRealtimeStatus((status) => {
        status.pendingJobNumber = data;
        return JSON.parse(JSON.stringify(status));
      });
    });
  }, []);

  const joinDetail = React.useCallback((deviceId: string) => {
    console.log("Joining room");
    socket?.emit(SocketIOEvents.joinRoom, deviceId);
  }, []);

  const leaveDetail = React.useCallback((deviceId: string) => {
    socket?.emit(SocketIOEvents.leaveRoom, deviceId);
  }, []);

  const sendCommand = React.useCallback(
    async (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        const uuid = new ObjectId().toString();
        console.log(`Waiting for ${uuid}'s result`);
        socket?.emit(SocketIOEvents.rpcCommand, { method, params }, uuid);
        socket?.once(`${SocketIOEvents.rpcResult}-${uuid}`, (data) => {
          resolve(data);
          socket?.off(`${SocketIOEvents.rpcError}-${uuid}`);
        });
        socket?.once(`${SocketIOEvents.rpcError}-${uuid}`, (data) => {
          reject(data);
          socket?.off(`${SocketIOEvents.rpcResult}-${uuid}`);
        });
      });
    },
    [socket]
  );

  const sendDockerCommand = React.useCallback(
    (value: DockerValue) => {
      return new Promise((resolve, reject) => {
        const uuid = new ObjectId().toString();
        socket?.emit(SocketIOEvents.dockerCommand, value, uuid);
        socket?.once(`${SocketIOEvents.dockerResult}-${uuid}`, (value) => {
          resolve(value);
          socket?.off(`${SocketIOEvents.dockerResult}t-${uuid}`);
          socket?.off(`${SocketIOEvents.dockerError}-${uuid}`);
        });

        socket?.once(`${SocketIOEvents.dockerError}-${uuid}`, (value) => {
          reject(value);
          socket?.off(`${SocketIOEvents.dockerResult}-${uuid}`);
          socket?.off(`${SocketIOEvents.dockerError}-${uuid}`);
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
