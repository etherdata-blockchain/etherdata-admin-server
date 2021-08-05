import { BasePlugin, BaseSocketIOPlugin } from "./plugin/basePlugin";
import { Express } from "express";

export class Server {
  plugins: BaseSocketIOPlugin[];

  constructor(plugins: BaseSocketIOPlugin[]) {
    this.plugins = plugins;
  }

  async start(server: Express) {
    for (let plugin of this.plugins) {
      await plugin.startSocketIOServer(server);
    }
  }
}
