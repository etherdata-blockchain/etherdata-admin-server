/**
 * All used environment
 */
import { JSONSchema7 } from "json-schema";

export class Environments {
  /**
   * Get serverside environments
   * @constructor
   */
  static get ServerSideEnvironments() {
    return {
      STATS_SERVER: process.env.STATS_SERVER!,
      MONGODB_URL: process.env.MONGODB_URL!,
      PUBLIC_SECRET: process.env.PUBLIC_SECRET!,
      STORAGE_MANAGEMENT_URL: process.env.STORAGE_MANAGEMENT_URL!,
      STORAGE_MANAGEMENT_API_TOKEN: process.env.STORAGE_MANAGEMENT_API_TOKEN!,
    };
  }

  /**
   * Get client side environments starts with NEXT_
   * Only can be used on client side
   * @constructor
   */
  static get ClientSideEnvironments() {
    return {
      NEXT_PUBLIC_SECRET: process.env.NEXT_PUBLIC_SECRET!,
      NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID!,
      NEXT_PUBLIC_STATS_SERVER: process.env.NEXT_PUBLIC_STATS_SERVER!,
      NEXT_PUBLIC_CLIENT_PASSWORD: process.env.NEXT_PUBLIC_CLIENT_PASSWORD!,
      NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION!,
    };
  }

  /**
   * Get schema for environments
   * @param serverEnvs
   * @param clientEnvs
   */
  static getSchemaForEnvironments(
    serverEnvs: {
      [key: string]: string;
    },
    clientEnvs: { [key: string]: string }
  ): JSONSchema7 {
    const clientSchema: { [key: string]: JSONSchema7 } = {};
    const serverSchema: { [key: string]: JSONSchema7 } = {};

    for (const [key, value] of Object.entries(clientEnvs)) {
      clientSchema[key] = {
        title: key,
        type: "string",
        default: value,
      };
    }

    for (const [key, value] of Object.entries(serverEnvs)) {
      serverSchema[key] = {
        title: key,
        type: "string",
        default: value,
      };
    }

    return {
      title: "Environments",
      description: "List of environments used",
      properties: {
        clientEnvs: {
          title: "Client Environments",
          type: "object",
          properties: clientSchema,
        },
        serverEnvs: {
          title: "Server Environments",
          type: "object",
          properties: clientSchema,
        },
      },
    };
  }
}
