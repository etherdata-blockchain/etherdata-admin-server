import moment, { Moment } from "moment";
import { interfaces } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";

/**
 * Node client
 */
export class NodeClient {
  in_time: Moment;
  // When will we delete the client from memory
  out_time: Moment;
  web3Data: interfaces.Web3DataInfo | undefined;
  // Maximum inactive time in minutes
  removeLimit = 1;
  isOnline: boolean;
  id: string;

  /**
   *
   * @param id
   */
  constructor(id: string) {
    this.in_time = moment();
    this.out_time = this.in_time.add(this.removeLimit, "minutes");
    this.isOnline = true;
    this.id = id;
  }

  /**
   * If this function returns true, then remove this client from memory
   */
  shouldBeRemoved(): boolean {
    const current = moment();
    return current.isAfter(this.out_time) && !this.isOnline;
  }

  /**
   * Update the client out time
   */
  update() {
    this.in_time = moment();
    this.out_time = this.in_time.add(this.removeLimit, "minutes");
  }

  // eslint-disable-next-line require-jsdoc
  updateData(newData: interfaces.Web3DataInfo) {
    this.web3Data = newData;
  }

  // eslint-disable-next-line require-jsdoc
  updateOnlineStatus(newStatus: boolean) {
    this.isOnline = newStatus;
  }

  /**
   * Get a json object.
   * @param omitPeers. Whether include peer's info in object.
   */
  toJSON(omitPeers = true): schema.IDevice {
    if (omitPeers) {
      return {
        id: this.id,
        isOnline: this.isOnline,
        //@ts-ignore
        lastSeen: this.in_time.toISOString(),
        data: this.web3Data
          ? {
              ...this.web3Data,
              peers: [],
            }
          : undefined,
      };
    }
    return {
      id: this.id,
      isOnline: this.isOnline,
      //@ts-ignore
      lastSeen: this.in_time.toISOString(),
      data: this.web3Data,
    };
  }
}
