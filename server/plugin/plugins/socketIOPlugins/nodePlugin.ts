import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { Express } from "express";
import { Client } from "../../../client/client";
import Logger from "../../../logger";
import { Server, Socket } from "socket.io";
import { Web3DataInfo } from "../../../client/node_data";
import { DeviceRegistrationPlugin } from "../deviceRegistrationPlugin";

export class NodePlugin extends BaseSocketIOPlugin {
  protected pluginName: string = "node";
  private checkClientInterval: number = 1000 * 10;
  clients: {
    [key: string]: Client;
  } = {};

  private registeredDevices: string[] = [];

  constructor() {
    super();
    this.handlers = [this.handleNodeInfo, this.handleOnDisConnect];
  }

  async startSocketIOServer(server: Server): Promise<boolean | undefined> {
    this.periodicRemoveClient();
    this.server = server.of("/nodes");
    this.connectServer();
    return true;
  }

  /**
   * Authenticate with configuration's password
   * @param password
   */
  auth(password: string): boolean {
    return process.env.NODE_PASSWORD === password;
  }

  /**
   * Periodically remove inactive clients
   * @private
   */
  private periodicRemoveClient() {
    setInterval(() => {
      let clientPlugin = this.otherPlugins["client"];
      let shouldDeleteClients = Object.values(this.clients).filter((c) =>
        c.shouldBeRemoved()
      );
      shouldDeleteClients.forEach((c) => {
        this.removeClient(c.id);
        clientPlugin.server?.emit("realtime-info", {
          type: "delete",
          data: c.toJSON(),
        });
        Logger.info(
          `Remove node client ${c.id} due to long time offline. Current number of clients: ${this.clients.length}`
        );
      });
    }, this.checkClientInterval);
  }

  /**
   * Remove Client from clients
   * @param id
   * @private
   */
  private removeClient(id: string) {
    let i = 0;
    delete this.clients[id];
  }

  protected onAuthenticated(socket: Socket): void {
    let found = this.clients[socket.id];
    let clientPlugin = this.otherPlugins["client"];
    // If the client back online again, we will update its status
    if (found) {
      found.isOnline = true;
      found.update();
      Logger.info(`Node Client ${socket.id} back online again.`);
      clientPlugin.server?.emit("realtime-info", {
        type: "update",
        data: found.toJSON(),
      });
    } else {
      // Otherwise, we add new client
      let client = new Client(socket.id);
      this.clients[socket.id] = client;
      clientPlugin.server?.emit("realtime-info", {
        type: "insert",
        data: client.toJSON(),
      });
    }
  }

  protected onUnAuthenticated(socket: Socket): void {
    socket.disconnect();
  }

  /**
   * Send all nodes data back to client
   * @param socket
   */
  handleNodeInfo: SocketHandler = (socket) => {
    let dbPlugin = new DeviceRegistrationPlugin();
    socket.on("node-info", async (data: Web3DataInfo) => {
      let clientPlugin = this.otherPlugins["client"];
      let foundClient = this.clients[socket.id];
      if (foundClient) {
        foundClient.updateData(data);
        clientPlugin.server?.emit("realtime-info", {
          type: "update",
          data: foundClient.toJSON(),
        });
        // register device
        if (!this.registeredDevices.includes(data.systemInfo.nodeId!)) {
          await dbPlugin.addDevice({
            id: data.systemInfo.nodeId ?? "NONAME",
            name: data.systemInfo.name,
          });
          this.registeredDevices.push(data.systemInfo.nodeId!);
        }
      }
    });
  };

  handleOnDisConnect: SocketHandler = (socket) => {
    socket.on("disconnect", () => {
      let foundClient = this.clients[socket.id];
      let clientPlugin = this.otherPlugins["client"];
      if (foundClient) {
        foundClient.isOnline = false;
        Logger.info(
          `Node Client ${
            foundClient.id
          } is offline. Will be remove at ${foundClient.out_time.format()}`
        );
        clientPlugin.server?.to(foundClient.id).emit("realtime-info", {
          type: "update",
          data: foundClient.toJSON(false),
        });
        clientPlugin.server?.emit("realtime-info", {
          type: "update",
          data: foundClient.toJSON(),
        });
      }
    });
  };
}
