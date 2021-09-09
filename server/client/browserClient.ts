import { Web3DataInfo } from "./node_data";
import { ClientInterface } from "./nodeClient";

interface PaginationResult {
  devices: ClientInterface[];
  total: number;
  current: number;
}

export class BrowserClient {
  numPerPage: number = 30;
  currentPage: number = 0;

  /**
   * Generate pagination results based on current page number
   * @param devices
   */
  generatePaginationResult(devices: ClientInterface[]): PaginationResult {
    let start = this.currentPage * this.numPerPage;
    let end = (this.currentPage + 1) * this.numPerPage;

    let newDevices = devices.slice(start, end);

    return {
      devices: newDevices,
      total: devices.length,
      current: this.currentPage,
    };
  }
}
