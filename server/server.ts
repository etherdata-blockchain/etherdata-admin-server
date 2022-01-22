import { Server as SocketServer } from "socket.io";
import { BaseSocketIOService } from "@etherdata-blockchain/services/src/socket-io/socket_io_service";

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
