import {BaseSocketIOPlugin} from "./plugin/basePlugin";
import {Server as SocketServer} from "socket.io";

/**
 * Start a socket server with plugins
 */
export class Server {
  plugins: BaseSocketIOPlugin[];

  /**
   * Start plugins
   * @param {BaseSocketIOPlugin[]} plugins socket io plugin
   */
  constructor(plugins: BaseSocketIOPlugin[]) {
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
      await plugin?.startPlugin(server);
    }
  }
}
