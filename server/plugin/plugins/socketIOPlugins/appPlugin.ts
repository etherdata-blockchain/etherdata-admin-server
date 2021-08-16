/**
 * App plugin for app use
 */

import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { NodePlugin } from "./nodePlugin";
import Logger from "../../../logger";

export class AppPlugin extends BaseSocketIOPlugin {
  protected pluginName: string = "app";

  constructor() {
    super();
    this.handlers = [this.joinRoomHandler, this.leaveRoomHandler];
  }

  auth(password: string): boolean {
    // Use jwt authentication
    let secret = process.env.NEXT_PUBLIC_SECRET!;
    try {
      jwt.verify(password, secret);
      return true;
    } catch (err) {
      return false;
    }
  }

  protected onAuthenticated(socket: Socket): void {}

  protected onUnAuthenticated(socket: Socket): void {}

  async startSocketIOServer(server: Server): Promise<boolean | undefined> {
    this.server = server.of("/apps");
    this.connectServer();
    return true;
  }

  /**
   * Join room when user send join room request
   * @param socket
   */
  joinRoomHandler: SocketHandler = (socket) => {
    socket.on("join-room", (roomId: string) => {
      let nodePlugin = this.otherPlugins["node"] as NodePlugin;
      let found = false;
      for (let client of Object.values(nodePlugin.clients)) {
        if (client.web3Data?.systemInfo.nodeId === roomId) {
          socket.join(roomId);
          found = true;
        }
      }

      if (!found) {
        socket.emit("join-room-error", {
          err: "Cannot join the room. Client is not online",
        });
      }
    });
  };

  /**
   * Leave room when user send leave room request
   * @param socket
   */
  leaveRoomHandler: SocketHandler = (socket) => {
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
    });
  };
}
