import { SocketHandler } from "../../basePlugin";
import { Server, Socket } from "socket.io";
import { AppPlugin } from "./appPlugin";
import {
  BrowserClient,
  ClientFilter,
  PaginationResult,
} from "../../../client/browserClient";
import { RegisteredPlugins } from "./registeredPlugins";
import { Environments } from "../../../../internal/const/environments";

/**
 * Web Browser socket io plugin
 */
export class ClientPlugin extends AppPlugin {
  pluginName: RegisteredPlugins = "client";

  browserClients: {
    [key: string]: BrowserClient;
  } = {};

  constructor() {
    super();
    this.handlers = [
      this.joinRoomHandler,
      this.leaveRoomHandler,
      this.rpcCommandHandler,
      this.disconnectHandler,
      this.handlePageChange,
      this.handlePushUpdates,
      this.handleApplyFilter,
      this.dockerCommandHandler,
    ];
  }

  auth(password: string): boolean {
    return (
      Environments.ClientSideEnvironments.NEXT_PUBLIC_CLIENT_PASSWORD ===
      password
    );
    // return true;
  }

  async startSocketIOServer(server: Server): Promise<boolean | undefined> {
    this.server = server.of("/clients");
    this.connectServer();
    return true;
  }

  /**
   * Change page
   * @param socket
   */
  handlePageChange: SocketHandler = (socket) => {
    socket.on("page-change", async (deviceIds: string[]) => {
      let client = this.browserClients[socket.id];
      if (client) {
        client.deviceIds = deviceIds;
        // Send new data to clients
        let pageResults = await client.generatePaginationResult();
        socket.emit("realtime-info", pageResults);
        socket.emit("page-changed", true);
      }
    });
  };

  /**
   * Change page
   * @param socket
   */
  handleApplyFilter: SocketHandler = (socket) => {
    socket.on("apply-filter", async (filter: ClientFilter) => {
      // eslint-disable-next-line no-invalid-this
      const client = this.browserClients[socket.id];
      if (client) {
        client.currentFilter = filter;
        client.currentPage = 0;
        // Send new data to clients
        const pageResults = await client.generatePaginationResult();
        socket.emit("realtime-info", pageResults);
      }
    });
  };

  sendDataToClient = async (
    client: BrowserClient,
    socketID: string,
    data: PaginationResult
  ) => {
    this.server?.to(socketID).emit("realtime-info", data);
  };

  protected async onAuthenticated(socket: Socket) {
    let client = new BrowserClient();
    this.browserClients[socket.id] = client;
    let data = await client.generatePaginationResult();
    await this.sendDataToClient(client, socket.id, data);
  }

  protected onUnAuthenticated(socket: Socket): void {}
}
