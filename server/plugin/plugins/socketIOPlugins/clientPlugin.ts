import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { Server, Socket } from "socket.io";
import Logger from "../../../logger";
import { AppPlugin } from "./appPlugin";
import {
  BrowserClient,
  ClientFilter,
  PaginationResult,
} from "../../../client/browserClient";
import { RegisteredPlugins } from "./registeredPlugins";
import { IDevice } from "../../../schema/device";
import { PendingJobPlugin } from "../pendingJobPlugin";
import mongoose from "mongoose";

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
    ];
  }

  auth(password: string): boolean {
    return process.env.NEXT_PUBLIC_CLIENT_PASSWORD === password;
    // return true;
  }

  protected async onAuthenticated(socket: Socket) {
    let client = new BrowserClient();
    this.browserClients[socket.id] = client;
    let data = await client.generatePaginationResult();
    await this.sendDataToClient(client, socket.id, data);
  }

  protected onUnAuthenticated(socket: Socket): void {}

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
    socket.on("page-change", async (pageNum: number) => {
      let client = this.browserClients[socket.id];
      if (client) {
        client.currentPage = pageNum;
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
      let client = this.browserClients[socket.id];
      if (client) {
        client.currentFilter = filter;
        client.currentPage = 0;
        // Send new data to clients
        let pageResults = await client.generatePaginationResult();
        socket.emit("realtime-info", pageResults);
      }
    });
  };

  /**
   * Send data to all browser clients
   * @param devices
   */
  sendDataToAllClients = async (devices: IDevice[]) => {
    for (let [socketID, client] of Object.entries(this.browserClients)) {
      // Send pagination data to all browser clients
      this.server
        ?.to(socketID)
        .emit("realtime-info", await client.generatePaginationResult());
    }
  };

  sendDataToClient = async (
    client: BrowserClient,
    socketID: string,
    data: PaginationResult
  ) => {
    this.server?.to(socketID).emit("realtime-info", data);
  };
}
