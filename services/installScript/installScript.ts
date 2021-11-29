/**
 * Generate relative data for install script.
 * The generated output will be a zip file
 */

import { stringify } from "envfile";
import YAML from "yaml";

// eslint-disable-next-line require-jsdoc
export class InstallScriptService {
  env: { [key: string]: string };

  // eslint-disable-next-line require-jsdoc
  constructor(env: { [key: string]: string }) {
    this.env = env;
  }

  /**
   * Generate docker a docker-compose file for the use of installation
   *
   * @return {string} Generated docker-compose file in yaml format
   */
  generateDockerComposeFile(): string {
    const dockerCompose: any = {
      services: {
        worker: {
          network_mode: "host",
          image: "sirily11/etd-remote-admin-server:v1.8.2",
          restart: "always",
          environment: [
            "init_node=false",
            "http_port=8547",
            "ws_port=8548",
            "http_addr=localhost",
            "network_id=12349",
            "port=30303",
            "coinbase=${etd_coinbase}",
            "max_peers=${etd_max_peers}",
            "secure_rpc=${etd_secure_rpc}",
            "sync_only=${etd_sync_only}",
          ],
          volumes: ["./datav25:/home/data", "./logs:/home/logs"],
          labels: ["com.centurylinklabs.watchtower.enable=false"],
        },
      },

      version: "3",
    };
    return YAML.stringify(dockerCompose);
  }

  /**
   * Generate a file contains static nodes
   *
   * @return {string} Generated static nodes file content
   */
  generateStaticNodesFile(): string {
    return "";
  }

  /**
   * Generate a env file
   *
   * @return {string} Generated env file
   */
  generateEnvFile(): string {
    return stringify(this.env);
  }

  /**
   * Generate a zip file
   *
   * @return {any} generated zip
   */
  generateZipFile(): any {
    return "";
  }
}
