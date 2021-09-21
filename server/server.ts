import { BasePlugin, BaseSocketIOPlugin } from "./plugin/basePlugin";
import { Express } from "express";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import Logger from "./logger";

export class Server {
  plugins: BaseSocketIOPlugin[];

  constructor(plugins: BaseSocketIOPlugin[]) {
    this.plugins = plugins;
  }

  async start(httpServer: any) {
    const server = new SocketServer(httpServer, { cors: { origin: "*" } });
    Logger.info("Creating redis adapter");
    const pubClient = createClient({
      url: "",
    });
    const subClient = pubClient.duplicate();
    const redisAdapter = createAdapter(pubClient, subClient);

    // Create a redis adapter
    //@ts-ignore
    server.adapter(redisAdapter);

    for (let plugin of this.plugins) {
      plugin.connectPlugins(this.plugins);
      await plugin.startSocketIOServer(server);
    }
  }
}
