import {
  BasePlugin,
  BaseSocketAuthIOPlugin,
  BaseSocketIOPlugin,
} from "./plugin/basePlugin";
import { Server as SocketServer } from "socket.io";

export class Server {
  plugins: BaseSocketIOPlugin[];

  constructor(plugins: BaseSocketIOPlugin[]) {
    this.plugins = plugins;
  }

  async start(httpServer: any) {
    const server = new SocketServer(httpServer, { cors: { origin: "*" } });
    for (let plugin of this.plugins) {
      plugin.connectPlugins(this.plugins);
      await plugin?.startPlugin(server);
    }
  }
}
