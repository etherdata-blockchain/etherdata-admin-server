import { Server as SocketServer } from "socket.io";

import express from "express";
import { createServer } from "http";
import { socketServices } from "@etherdata-blockchain/services";
import mongoose from "mongoose";
import { configs, enums } from "@etherdata-blockchain/common";
import Logger from "@etherdata-blockchain/logger";
import { DeviceRegistrationService } from "@etherdata-blockchain/services/dist/mongodb";
import { schema } from "@etherdata-blockchain/storage-model";
import { BaseSocketIOService } from "@etherdata-blockchain/services/dist/socket-io/socket_io_service";

/**
 * Start a socket server with plugins
 */
export class Server {
  plugins: BaseSocketIOService[];

  /**
   * Start plugins
   * @param {BaseSocketIOPlugin[]} plugins socket io plugin
   */
  constructor(plugins: BaseSocketIOService[]) {
    this.plugins = plugins;
  }

  /**
   * Start plugins
   * @param {any} httpServer http server
   */
  async start(httpServer: any) {
    const server = new SocketServer(httpServer, { cors: { origin: "*" } });
    for (const plugin of this.plugins) {
      plugin.connectPlugins(this.plugins);
      await plugin?.startPlugin(server as any);
    }
  }
}

export const initApp = async () => {
  const server = express();
  const httpServer = createServer(server);
  const plugins: any[] = [
    new socketServices.ClientService(),
    new socketServices.APpService(),
    new socketServices.DBChangeService(),
  ];
  const socketIOServer = new Server(plugins);

  // @ts-ignore
  global.nodePlugin = plugins[0];

  await mongoose.connect(
    configs.Environments.ServerSideEnvironments.MONGODB_URL,
    {
      dbName: "etd",
    }
  );
  Logger.info("Connected to database");

  await socketIOServer.start(httpServer);
  return { httpServer, server };
};
