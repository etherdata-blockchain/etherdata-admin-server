/**
 * App plugin for app use
 */

import {
  BaseSocketAuthIOPlugin,
  BaseSocketIOPlugin,
  SocketHandler,
} from "../../basePlugin";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { NodePlugin } from "./nodePlugin";
import Logger from "../../../logger";
import { JobResultModel } from "../../../schema/job-result";

interface RPCCommand {
  methodName: string;
  params: any[];
}

export class AppPlugin extends BaseSocketAuthIOPlugin {
  pluginName: string = "app";
  /**
   * SocketID: UserID
   * @protected
   */
  protected user: { [key: string]: string } = {};

  constructor() {
    super();
    this.handlers = [
      this.joinRoomHandler,
      this.leaveRoomHandler,
      this.rpcCommandHandler,
      this.disconnectHandler,
    ];
  }

  auth(password: string): boolean {
    // Use jwt authentication
    let secret = process.env.PUBLIC_SECRET!;
    try {
      jwt.verify(password, secret);

      return true;
    } catch (err) {
      // return false;
      return true;
    }
  }

  protected onAuthenticated(socket: Socket, password: string): void {
    let data = jwt.decode(password, { json: true });
    this.user[socket.id] = data!.user;
  }

  protected onUnAuthenticated(socket: Socket): void {}

  async startSocketIOServer(server: Server): Promise<boolean | undefined> {
    this.server = server.of("/apps");
    this.connectServer();
    return true;
  }

  disconnectHandler: SocketHandler = (socket) => {
    socket.on("disconnect", () => {
      delete this.user[socket.id];
    });
  };

  /**
   * Join room when user send join room request
   * @param socket
   */
  joinRoomHandler: SocketHandler = (socket) => {
    socket.on("join-room", (roomId: string) => {
      let found = false;
      if (socket.rooms.size > 2) {
        socket.emit("join-room-error", {
          err: "You have already joined another room. You need to leave first!",
        });
        return;
      }

      if (!found) {
        Logger.error("Cannot join the room. Client is not online");
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

  /**
   * Send rpc command based on joined room.
   * @param socket
   */
  rpcCommandHandler: SocketHandler = (socket) => {
    socket.on("rpc-command", (command: RPCCommand) => {
      let rooms = Array.from(socket.rooms);
      if (rooms.length < 2) {
        Logger.error("Cannot run rpc-command, not in any room!");
        socket.emit("rpc-command-error", {
          err: "Cannot join the room. Not in any room!",
        });
      } else {
        // room id also is the node id
        let selectedRoom = rooms[1];
        // TODO: Add job to the pending job collection
      }
    });
  };
}
