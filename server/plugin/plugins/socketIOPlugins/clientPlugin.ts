import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { Server, Socket } from "socket.io";
import { NodePlugin } from "./nodePlugin";
import Logger from "../../../logger";

export class ClientPlugin extends BaseSocketIOPlugin {
  protected pluginName: string = "client";

  constructor() {
    super();
    this.handlers = [this.handleJoinRoom, this.handleLeaveRoom];
  }

  auth(password: string): boolean {
    return process.env.NEXT_PUBLIC_CLIENT_PASSWORD === password;
  }

  protected onAuthenticated(socket: Socket): void {
    let plugin = this.otherPlugins["node"] as NodePlugin;
    this.server!.emit("realtime-info", {
      type: "init",
      data: Object.values(plugin.clients).map((c) => c.toJSON()),
    });
  }

  protected onUnAuthenticated(socket: Socket): void {}

  async startSocketIOServer(server: Server): Promise<boolean | undefined> {
    this.server = server.of("/clients");
    this.connectServer();
    return true;
  }

  handleJoinRoom: SocketHandler = (socket) => {
    socket.on("detail", (deviceId: string) => {
      Logger.warning(`Client ${socket.id} joined room ${deviceId}`);
      socket.join(deviceId);
    });
  };

  handleLeaveRoom: SocketHandler = (socket) => {
    socket.on("leave-detail", (deviceId: string) => {
      Logger.warning(`Client ${socket.id} left room ${deviceId}`);
      socket.leave(deviceId);
    });
  };
}
