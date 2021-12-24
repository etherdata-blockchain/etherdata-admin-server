import { Server, Socket } from "socket.io";
import { AppPlugin } from "./appPlugin";
import { RegisteredPlugins } from "./registeredPlugins";
import { Environments } from "../../../../internal/const/environments";

/**
 * Web Browser socket io plugin
 */
export class ClientPlugin extends AppPlugin {
  pluginName: RegisteredPlugins = "client";

  constructor() {
    super();
    this.handlers = [
      this.joinRoomHandler,
      this.leaveRoomHandler,
      this.rpcCommandHandler,
      this.disconnectHandler,
      this.handlePushUpdates,
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

  protected onUnAuthenticated(socket: Socket): void {}
}
