import React from "react";
import io, { Socket } from "socket.io-client";
import { UIProviderContext } from "./UIProvider";

import { ObjectId } from "bson";
import { Environments } from "../../internal/const/environments";

interface DockerValue {
  method: "logs" | "start" | "stop" | "remove" | "restart" | "exec";
  value: any;
}

interface DeviceInterface {
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
  }, []);

  const joinDetail = React.useCallback((deviceId: string) => {
    console.log("Joining room");
    socket?.emit("join-room", deviceId);
  }, []);

  const leaveDetail = React.useCallback((deviceId: string) => {
    socket?.emit("leave-room", deviceId);
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
    joinDetail,
    leaveDetail,
    sendCommand,
    sendDockerCommand,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
