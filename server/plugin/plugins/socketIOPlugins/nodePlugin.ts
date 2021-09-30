import { BaseSocketIOPlugin, SocketHandler } from "../../basePlugin";
import { Express } from "express";
import Logger from "../../../logger";
import { Server, Socket } from "socket.io";
import { Web3DataInfo } from "../../../client/node_data";
import { DeviceRegistrationPlugin } from "../deviceRegistrationPlugin";
import { ClientPlugin } from "./clientPlugin";
import { AppPlugin } from "./appPlugin";
import { NodeClient } from "../../../client/nodeClient";

export class NodePlugin {}
