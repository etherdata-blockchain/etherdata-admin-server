import { Web3DataInfo } from "./node_data";
import { ClientInterface } from "./nodeClient";

export interface PaginationResult {
  devices: ClientInterface[];
  totalPageNumber: number;
  currentPageNumber: number;
  totalNumberDevices: number;
  totalOnlineDevices: number;
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
    let totalNumberPages = Math.ceil(devices.length / this.numPerPage);
    let onlineDevices = devices.filter((d) => d.isOnline);

    let newDevices = devices.slice(start, end);

    return {
      devices: newDevices,
      totalPageNumber: totalNumberPages,
      currentPageNumber: this.currentPage,
      totalNumberDevices: devices.length,
      totalOnlineDevices: onlineDevices.length,
    };
  }
}
