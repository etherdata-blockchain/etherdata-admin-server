import { Web3DataInfo } from "./node_data";
import { DeviceRegistrationPlugin } from "../plugin/plugins/deviceRegistrationPlugin";
import { IDevice } from "../schema/device";

export interface PaginationResult {
  devices: IDevice[];
  totalPageNumber: number;
  currentPageNumber: number;
  totalNumberDevices: number;
  totalOnlineDevices: number;
  numPerPage: number;
}

export class BrowserClient {
  numPerPage: number = 15;
  currentPage: number = 0;
  lastResult?: PaginationResult;

  /**
   * Generate pagination results based on current page number
   */
  async generatePaginationResult(): Promise<PaginationResult> {
    let devicePlugin = new DeviceRegistrationPlugin();

    let devices =
      (await devicePlugin.list(this.currentPage, this.numPerPage)) ?? [];

    let onlineDevicesCount = await devicePlugin.getOnlineDevicesCount();
    let totalNumDevices = await devicePlugin.count();

    let paginationResult = {
      devices: devices,
      totalPageNumber: Math.floor(totalNumDevices / this.numPerPage),
      currentPageNumber: this.currentPage,
      totalNumberDevices: totalNumDevices,
      totalOnlineDevices: onlineDevicesCount,
      numPerPage: this.numPerPage,
    };

    this.lastResult = paginationResult;
    return paginationResult;
  }
}
