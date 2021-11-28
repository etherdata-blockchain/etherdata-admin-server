import { Namespace, Server, Socket } from "socket.io";
import { Document, Model, Query } from "mongoose";
import { PluginName } from "./pluginName";
import Logger from "../logger";
import { RegisteredPlugins } from "./plugins/socketIOPlugins/registeredPlugins";

export type SocketHandler = (socket: Socket) => void;

export interface PeriodicJob {
  /**
   * In seconds
   */
  interval: number;
  name: string;
  timer?: NodeJS.Timer;

  job(): Promise<void>;
}

export abstract class BasePlugin<N> {
  abstract pluginName: N;
}

export abstract class BaseSocketIOPlugin extends BasePlugin<RegisteredPlugins> {
  protected otherPlugins: { [key: string]: BaseSocketIOPlugin } = {};
  protected periodicJobs: PeriodicJob[] = [];

  async startPlugin(server: Server) {
    let count = 0;
    for (const job of this.periodicJobs) {
      job.timer = setInterval(async () => {
        await job.job();
      }, job.interval * 1000);
      this.periodicJobs[count] = job;
      count += 1;
    }
  }

  stopPeriodicJobByName(name: string) {
    const job = this.periodicJobs.find((j) => j.name === name);
    if (job) {
      clearInterval(job.timer!);
    } else {
      throw new Error("Cannot find job with this name");
    }
  }

  connectPlugins(plugins: BaseSocketIOPlugin[]) {
    for (const plugin of plugins) {
      if (plugin.pluginName !== this.pluginName) {
        this.otherPlugins[plugin.pluginName] = plugin;
      }
    }
  }

  protected findPlugin<T extends BaseSocketIOPlugin>(
    pluginName: RegisteredPlugins
  ): T | undefined {
    try {
      //@ts-ignore
      return this.otherPlugins[pluginName];
    } catch (err) {
      throw new Error("Cannot find this plugin with name " + pluginName);
    }
  }
}

export abstract class BaseSocketAuthIOPlugin extends BaseSocketIOPlugin {
  /**
   * List of socket handlers
   */
  handlers: SocketHandler[] = [];
  /**
   * Socket IO Server
   */
  server?: Namespace;
  protected otherPlugins: { [key: string]: BaseSocketIOPlugin } = {};

  /**
   * Start a SocketIO server.
   * @param server
   *
   * @return an indicator indicates the status of the socket io.
   * If return undefined, then this plugin doesn't have websocket functionality
   */
  abstract startSocketIOServer(server: Server): Promise<boolean | undefined>;

  /**
   * Authenticate with configuration's password
   * @param password
   */
  abstract auth(password: string): boolean;

  async startPlugin(server: Server) {
    await super.startPlugin(server);
    await this.startSocketIOServer(server);
  }

  connectServer() {
    if (this.server === undefined) {
      throw new Error("You should initialize your server");
    } else {
      this.server.on("connection", (socket) => {
        const token = socket.handshake.auth.token;
        const authenticated = this.auth(token);
        if (authenticated) {
          Logger.info(
            `[${this.pluginName}]: Client ${socket.id} is authenticated!`
          );
          this.onAuthenticated(socket, token);
          for (const handle of this.handlers) {
            handle(socket);
          }
        } else {
          Logger.error(
            `[${this.pluginName}]: Client ${socket.id} is not authenticated, drop connection`
          );
          this.onUnAuthenticated(socket);
        }
      });
    }
  }

  protected abstract onAuthenticated(socket: Socket, password: string): void;

  protected abstract onUnAuthenticated(socket: Socket): void;
}

export abstract class DatabasePlugin<
  T extends Document
> extends BasePlugin<PluginName> {
  protected abstract model: Model<T>;

  async get(id: string): Promise<T | undefined> {
    const result = await this.performGet(id).exec();
    if (result) {
      return result;
    } else {
      return undefined;
    }
  }

  async list(pageNumber: number, pageSize: number): Promise<T[] | undefined> {
    const results = this.performList();
    const pageResults = this.doPagination(results, pageNumber, pageSize);

    return await pageResults.exec();
  }

  async performCreate(data: T): Promise<T> {
    return await this.model.create(data);
  }

  async create(
    data: T,
    { upsert }: { upsert: boolean }
  ): Promise<T | undefined> {
    if (upsert) {
      return await this.performPatch(data);
    } else {
      return await this.performCreate(data);
    }
  }

  async performPatch(data: T): Promise<T> {
    const result = await this.model.findOneAndUpdate(
      { _id: data._id },
      //@ts-ignore
      data,
      { upsert: true }
    );

    return result;
  }

  async patch(data: T) {
    return await this.performPatch(data);
  }

  async count() {
    return this.model.countDocuments();
  }

  protected performGet(id: string): Query<T, T> {
    //@ts-ignore
    return this.model.findOne({ _id: id });
  }

  protected performList(): Query<T[], T[]> {
    //@ts-ignore
    return this.model.find({});
  }

  protected doPagination(
    model: Query<T[], T[]>,
    pageNumber: number,
    pageSize: number
  ): Query<T[], T[]> {
    const skip = Math.max(0, (pageNumber ?? 0 - 1) * (pageSize ?? 20));
    const limit = pageSize ?? 20;

    return model.skip(skip).limit(limit);
  }
}
