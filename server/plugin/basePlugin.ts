import { Namespace, Server, Socket } from "socket.io";
import { Aggregate, Document, Model, Query } from "mongoose";
import { PluginName } from "./pluginName";
import Logger from "../logger";
import { RegisteredPlugins } from "./plugins/socketIOPlugins/registeredPlugins";
import { PaginationResult } from "../../internal/const/common_interfaces";
import { Configurations } from "../../internal/const/configurations";

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

/**
 * Basic plugin with plugin name
 */
export abstract class BasePlugin<N> {
  abstract pluginName: N;
}

/**
 * Basic socket io plugin
 */
export abstract class BaseSocketIOPlugin extends BasePlugin<RegisteredPlugins> {
  protected otherPlugins: { [key: string]: BaseSocketIOPlugin } = {};
  protected periodicJobs: PeriodicJob[] = [];

  /**
   * Starting the plugin. This will also start the periodic jobs
   * @param{Server} server socket io server
   */
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

  /**
   * Stop periodic job by job name
   * @param{string} name job name
   */
  stopPeriodicJobByName(name: string) {
    const job = this.periodicJobs.find((j) => j.name === name);
    if (job) {
      clearInterval(job.timer!);
    } else {
      throw new Error("Cannot find job with this name");
    }
  }

  /**
   * Connect plugins to other plugins. So that this plugin can use other plugins' functionalities.
   * And also can be used by others.
   * @param{BaseSocketAuthIOPlugin[]} plugins list of socket io plugins
   */
  connectPlugins(plugins: BaseSocketIOPlugin[]) {
    for (const plugin of plugins) {
      if (plugin.pluginName !== this.pluginName) {
        this.otherPlugins[plugin.pluginName] = plugin;
      }
    }
  }

  /**
   * Find other plugin by name
   * @param{RegisteredPlugins} pluginName A defined plugin name. You need to register your plugin before usage
   * @protected
   * @return{BaseSocketIOPlugin} Found plugin
   */
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

/**
 * Base socket io plugin with authentication function
 */
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

  /**
   * Start a socket io plugin with authentication function enabled
   * @param server
   */
  async startPlugin(server: Server) {
    await super.startPlugin(server);
    await this.startSocketIOServer(server);
  }

  /**
   * This will authenticate clients. If the client provide a valid token, then it will be authenticated.
   * Otherwise, the connection between client and server will be dropped
   */
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

/**
 * Database plugin for mongoose database schema.
 * It will provide basic functionalities commonly used
 * in api system. For example, get, list, patch, delete, and search
 */
export abstract class DatabasePlugin<
  T extends Document
> extends BasePlugin<PluginName> {
  protected abstract model: Model<T>;

  /**
   * Get list of objects matched with the given query
   * @param query
   * @param pageNumber
   * @param pageSize
   */
  async filter(
    query: { [key: string]: any },
    pageNumber: number,
    pageSize: number
  ): Promise<PaginationResult<T> | undefined> {
    const results = () => this.model.find(query as any);
    return this.doPagination(results as any, pageNumber, pageSize);
  }

  /**
   * Get document by id
   * @param id
   */
  async get(id: string): Promise<T | undefined> {
    const result = await this.performGet(id).exec();
    if (result) {
      return result;
    } else {
      return undefined;
    }
  }

  /**
   * Get list of documents by page number
   * @param pageNumber current page
   * @param pageSize items per page
   */
  async list(
    pageNumber: number,
    pageSize: number
  ): Promise<PaginationResult<T> | undefined> {
    return this.doPagination(this.performList.bind(this), pageNumber, pageSize);
  }

  /**
   * Perform actual create operation
   * @param data
   */
  async performCreate(data: T): Promise<T> {
    return await this.model.create(data);
  }

  /**
   * Create an object
   * @param {any} data data
   * @param {boolean} upsert whether perform an upsert operation
   */
  async create(
    data: T,
    { upsert }: { upsert: boolean }
  ): Promise<T | undefined> {
    if (upsert) {
      return this.performPatch(data);
    } else {
      return this.performCreate(data);
    }
  }

  /**
   * Delete data
   * @param{any} data
   */
  async delete(data: T) {
    return this.model.findOneAndRemove({ _id: data._id }).exec();
  }

  /**
   * Perform patch operation
   * @param data
   */
  async performPatch(data: T): Promise<T> {
    return this.model.findOneAndUpdate(
      { _id: data._id },
      //@ts-ignore
      data,
      { upsert: true }
    );
  }

  /**
   * Update document by document's _id
   * @param{any} data
   */
  async patch(data: T) {
    return await this.performPatch(data);
  }

  /**
   * Return total number of documents
   */
  async count() {
    return this.model.countDocuments();
  }

  /**
   * Perform actual get operation
   * @param id
   * @protected
   */
  protected performGet(id: string): Query<T, T> {
    //@ts-ignore
    return this.model.findOne({ _id: id });
  }

  /**
   * Perform actual get operation
   * @protected
   */
  protected performList(): Query<T[], T[]> {
    //@ts-ignore
    return this.model.find({});
  }

  /**
   * Perform pagination operation
   * @param model
   * @param pageNumber current page number
   * @param pageSize items per page
   * @protected
   */
  protected async doPagination(
    model: () => Query<T[], T[]>,
    pageNumber: number,
    pageSize: number
  ): Promise<PaginationResult<T>> {
    if (pageNumber === 0) {
      throw Error("Page number should be greater than 0");
    }
    const skip = Math.max(
      0,
      (pageNumber - 1) * (pageSize ?? Configurations.numberPerPage)
    );
    const limit = pageSize ?? 20;
    const count = await model().countDocuments();
    const numPages = Math.ceil(count / pageSize);
    const results = await model().skip(skip).limit(limit).exec();

    return {
      count: count,
      currentPage: pageNumber,
      results: results,
      totalPage: numPages,
      pageSize: Configurations.numberPerPage,
    };
  }

  /**
   * Perform pagination operation on aggregation results
   * @param aggregation
   * @param model
   * @param pageNumber current page number
   * @param pageSize items per page
   * @protected
   */
  protected async doPaginationForAgg(
    aggregation: () => Aggregate<any>,
    model: () => Query<T[], T[]>,
    pageNumber: number,
    pageSize: number
  ): Promise<PaginationResult<T>> {
    if (pageNumber === 0) {
      throw Error("Page number should be greater than 0");
    }

    const skip = Math.max(
      0,
      (pageNumber - 1) * (pageSize ?? Configurations.numberPerPage)
    );
    const limit = pageSize ?? 20;
    const count = await model().countDocuments();
    const numPages = Math.ceil(count / pageSize);
    const results = await aggregation().skip(skip).limit(limit).exec();

    return {
      count: count,
      currentPage: pageNumber,
      results: results,
      totalPage: numPages,
      pageSize: Configurations.numberPerPage,
    };
  }
}
