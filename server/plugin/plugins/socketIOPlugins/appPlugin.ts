/**
 * App plugin for app use
 */

import { BaseSocketAuthIOPlugin, SocketHandler } from "../../basePlugin";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import Logger from "../../../logger";
import { RegisteredPlugins } from "./registeredPlugins";

import { PendingJobPlugin } from "../../../../internal/services/dbServices/pending-job-plugin";
import mongoose from "mongoose";
import { Environments } from "../../../../internal/const/environments";

interface RPCCommand {
  methodName: string;
  params: any[];
}

// eslint-disable-next-line valid-jsdoc
/**
 * App plugin is used for mobile app
 */
export class AppPlugin extends BaseSocketAuthIOPlugin {
  pluginName: RegisteredPlugins = "app";
  /**
   * SocketID: UserID
   * @protected
   */
  protected user: { [key: string]: string } = {};

  // eslint-disable-next-line require-jsdoc
  constructor() {
    super();
    this.handlers = [
      this.joinRoomHandler,
      this.leaveRoomHandler,
      this.rpcCommandHandler,
      this.disconnectHandler,
      this.dockerCommandHandler,
    ];
  }

  // eslint-disable-next-line require-jsdoc
  auth(password: string): boolean {
    // Use jwt authentication
    const secret = Environments.ServerSideEnvironments.PUBLIC_SECRET;
    try {
      jwt.verify(password, secret);

      return true;
    } catch (err) {
      // return false;
      return true;
    }
  }

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
    socket.on("join-room", async (roomId: string) => {
      console.log("Joining", roomId, "browser");
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
        const selectedRoom = this.canSubmitJob(socket);
        if (selectedRoom) {
          const job = {
            id: uuid,
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
            // eslint-disable-next-line new-cap
            job._id = mongoose.mongo.ObjectId(uuid);
          }
          //@ts-ignore
          await pendingJobPlugin.create(job, {});
        } else {
          Logger.error("Cannot run rpc-command, not in any room!");
          socket.emit("rpc-error", {
            err: "Cannot join the room. Not in any room!",
          });
        }
      }
    );
  };

  /**
   * Send docker command based on joined room.
   * @param socket
   */
  dockerCommandHandler: SocketHandler = (socket) => {
    socket.on("docker-command", async (value: any, uuid: string) => {
      console.log("Getting docker command", value, uuid);
      const pendingJobPlugin = new PendingJobPlugin();
      // eslint-disable-next-line no-invalid-this
      const selectedRoom = this.canSubmitJob(socket);
      if (selectedRoom) {
        const job = {
          id: uuid,
          targetDeviceId: selectedRoom,
          from: socket.id,
          time: new Date(),
          task: {
            type: "docker",
            value: value,
          },
        };
        /// Add id if user defined
        if (uuid) {
          //@ts-ignore
          // eslint-disable-next-line new-cap
          job._id = mongoose.mongo.ObjectId(uuid);
        }
        //@ts-ignore
        await pendingJobPlugin.create(job, {});
      } else {
        Logger.error("Cannot run docker-command, not in any room!");
        socket.emit("docker-error", {
          err: "Cannot join the room. Not in any room!",
        });
      }
    });
  };

  handlePushUpdates: SocketHandler = (socket) => {
    socket.on(
      "push-update",
      async (imageName: string, version: string, uuid: number | undefined) => {
        const pendingJobPlugin = new PendingJobPlugin();
        // eslint-disable-next-line no-invalid-this
        const selectedRoom = this.canSubmitJob(socket);
        if (selectedRoom) {
          const job = {
            targetDeviceId: selectedRoom,
            from: socket.id,
            time: new Date(),
            task: {
              type: "update-docker",
              value: {
                imageName,
                version,
              },
            },
          };
          //@ts-ignore
          // eslint-disable-next-line new-cap
          job._id = mongoose.mongo.ObjectId(uuid);
          //@ts-ignore
          await pendingJobPlugin.create(job, {});
        } else {
          Logger.error("Cannot run update-command, not in any room!");
          socket.emit("update-command-error", {
            err: "Cannot join the room. Not in any room!",
          });
        }
      }
    );
  };

  protected onAuthenticated(socket: Socket, password: string): void {
    const data = jwt.decode(password, { json: true });
    this.user[socket.id] = data!.user;
  }

  // eslint-disable-next-line require-jsdoc
  protected onUnAuthenticated(socket: Socket): void {}

  // eslint-disable-next-line require-jsdoc
  private canSubmitJob(socket: Socket): string | undefined {
    const rooms = Array.from(socket.rooms);
    if (rooms.length < 2) {
      return undefined;
    } else {
      return rooms[1];
    }
  }
}
