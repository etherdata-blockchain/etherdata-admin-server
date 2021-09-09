import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { Express } from "express";
import { NodeClient } from "../../../client/nodeClient";
import Logger from "../../../logger";
import { Server, Socket } from "socket.io";
import { Web3DataInfo } from "../../../client/node_data";
import { DeviceRegistrationPlugin } from "../deviceRegistrationPlugin";
import { ClientPlugin } from "./clientPlugin";
import { AppPlugin } from "./appPlugin";
import { BrowserClient } from "../../../client/browserClient";

export class NodePlugin extends BaseSocketIOPlugin {
  protected pluginName: string = "node";
  private checkClientInterval: number = 1000 * 10;
  nodeClients: {
    [key: string]: NodeClient;
  } = {};
  private registeredDevices: string[] = [];

  constructor() {
    super();
    this.handlers = [
      this.handleNodeInfo,
      this.handleOnDisConnect,
      this.handleOnRpcResult,
      this.handleRPCError,
    ];
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
      let clientPlugin = this.findPlugin<ClientPlugin>("client");
      let shouldDeleteClients = Object.values(this.nodeClients).filter((c) =>
        c.shouldBeRemoved()
      );
      shouldDeleteClients.forEach((c) => {
        this.removeClient(c.id);
        //TODO: Send data back to client
        clientPlugin.sendDataToAllClients(
          Object.values(this.nodeClients).map((n) => n.toJSON())
        );

        Logger.info(
          `Remove node client ${c.id} due to long time offline. Current number of clients: ${this.nodeClients.length}`
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
    delete this.nodeClients[id];
  }

  protected onAuthenticated(socket: Socket): void {
    let found = this.nodeClients[socket.id];
    let clientPlugin = this.findPlugin<ClientPlugin>("client");
    let appPlugin = this.findPlugin<AppPlugin>("app");
    // If the client back online again, we will update its status

    //TODO: Send pagination results
    clientPlugin.sendDataToAllClients(
      Object.values(this.nodeClients).map((n) => n.toJSON())
    );

    if (found) {
      found.isOnline = true;
      found.update();
      Logger.info(`Node Client ${socket.id} back online again.`);
    } else {
      // Otherwise, we add new client
      let client = new NodeClient(socket.id);
      this.nodeClients[socket.id] = client;
      // Send device data to app clients
      appPlugin.server
        ?.in(client.web3Data?.systemInfo.nodeId!)
        .emit("realtime-info", {
          type: "update",
          data: client.toJSON(),
        });
    }
  }

  protected onUnAuthenticated(socket: Socket): void {
    socket.disconnect();
  }

  /**
   * Find client by node ID
   * @param nodeId
   */
  findClient(nodeId: string): NodeClient | undefined {
    let found = Object.entries(this.nodeClients).find(
      ([id, client], index) =>
        client.web3Data?.systemInfo.nodeId === nodeId && client.isOnline
    );
    if (found) {
      return found[1];
    }
    return undefined;
  }

  /**
   * Send all nodes data back to client
   * @param socket
   */
  handleNodeInfo: SocketHandler = (socket) => {
    let dbPlugin = new DeviceRegistrationPlugin();
    socket.on("node-info", async (data: Web3DataInfo) => {
      let clientPlugin = this.findPlugin<ClientPlugin>("client");
      let appPlugin = this.findPlugin<AppPlugin>("app");
      let foundClient = this.nodeClients[socket.id];
      if (foundClient) {
        foundClient.updateData(data);
        //TODO: Send data to browser
        clientPlugin.sendDataToAllClients(
          Object.values(this.nodeClients).map((n) => n.toJSON())
        );

        // register device
        if (!this.registeredDevices.includes(data?.systemInfo?.nodeId ?? "")) {
          let success = await dbPlugin.addDevice({
            id: data.systemInfo?.nodeId ?? "NONAME",
            name: data.systemInfo?.name,
          });
          if (success) {
            this.registeredDevices.push(data.systemInfo.nodeId!);
          }
        }

        // Send device data to app clients
        appPlugin.server
          ?.in(foundClient.web3Data?.systemInfo.nodeId!)
          .emit("realtime-info", {
            type: "update",
            data: foundClient.toJSON(),
          });
      }
    });
  };

  handleOnDisConnect: SocketHandler = (socket) => {
    socket.on("disconnect", () => {
      let foundClient = this.nodeClients[socket.id];
      let clientPlugin = this.findPlugin<ClientPlugin>("client");
      let appPlugin = this.findPlugin("app");

      if (foundClient) {
        foundClient.isOnline = false;
        Logger.info(
          `Node Client ${
            foundClient.id
          } is offline. Will be remove at ${foundClient.out_time.format()}`
        );
        //TODO: Send data back to browser
        clientPlugin.sendDataToAllClients(
          Object.values(this.nodeClients).map((n) => n.toJSON())
        );

        appPlugin.server?.emit("realtime-info", {
          type: "update",
          data: foundClient.toJSON(),
        });
      }
    });
  };

  handleOnRpcResult: SocketHandler = (socket) => {
    socket.on("rpc-result", (data: any) => {
      let clientPlugin = this.findPlugin<ClientPlugin>("client");
      let appPlugin = this.findPlugin<AppPlugin>("app");
      let foundClient = this.nodeClients[socket.id];
      if (foundClient) {
        // Send data to app
        appPlugin.server
          ?.in(foundClient.web3Data?.systemInfo.nodeId!)
          .emit("rpc-result", data);

        // Send data to browser
        clientPlugin.server
          ?.in(foundClient.web3Data?.systemInfo.nodeId!)
          .emit("rpc-result", data);
      }
    });
  };

  handleRPCError: SocketHandler = (socket) => {
    socket.on("rpc-error", (data) => {
      let clientPlugin = this.findPlugin<ClientPlugin>("client");
      let appPlugin = this.findPlugin<AppPlugin>("app");
      let foundClient = this.nodeClients[socket.id];
      if (foundClient) {
        // Send data to app
        appPlugin.server
          ?.in(foundClient.web3Data?.systemInfo.nodeId!)
          .emit("rpc-command-error", data);

        // Send data to browser
        clientPlugin.server
          ?.in(foundClient.web3Data?.systemInfo.nodeId!)
          .emit("rpc-command-error", data);
      }
    });
  };
}
