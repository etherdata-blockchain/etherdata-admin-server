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
import { RegisteredPlugins } from "./registeredPlugins";
import { DeviceRegistrationPlugin } from "../deviceRegistrationPlugin";
import { PendingJobPlugin } from "../pendingJobPlugin";
import { IPendingJob } from "../../../schema/pending-job";
import mongoose from "mongoose";

interface RPCCommand {
  methodName: string;
  params: any[];
}

export class AppPlugin extends BaseSocketAuthIOPlugin {
  pluginName: RegisteredPlugins = "app";
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
    let plugin = new DeviceRegistrationPlugin();
    socket.on("join-room", async (roomId: string) => {
      let found = false;
      if (socket.rooms.size > 2) {
        socket.emit("join-room-error", {
          err: "You have already joined another room. You need to leave first!",
        });
        return;
      }

      Logger.info("Joining room " + roomId);
      socket.join(roomId);
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
    socket.on(
      "rpc-command",
      async (command: RPCCommand, uuid: number | undefined) => {
        const pendingJobPlugin = new PendingJobPlugin();
        let rooms = Array.from(socket.rooms);
        if (rooms.length < 2) {
          Logger.error("Cannot run rpc-command, not in any room!");
          socket.emit("rpc-command-error", {
            err: "Cannot join the room. Not in any room!",
          });
        } else {
          // room id also is the node id
          let selectedRoom = rooms[1];
          let job = {
            targetDeviceId: selectedRoom,
            from: socket.id,
            time: new Date(),
            task: {
              type: "web3",
              value: command,
            },
          };
          /// Add id if user defined
          if (uuid) {
            //@ts-ignore
            job._id = mongoose.mongo.ObjectId(uuid);
          }
          //@ts-ignore
          await pendingJobPlugin.create(job, {});
        }
      }
    );
  };
}
