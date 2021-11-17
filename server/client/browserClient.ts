import {
  DeviceRegistrationPlugin,
  VersionInfo,
} from "../plugin/plugins/deviceRegistrationPlugin";
import { IDevice } from "../schema/device";

export interface ClientFilter {
  key: string;
  value: any;
}

export interface PaginationResult {
  devices: IDevice[];
  totalPageNumber: number;
  currentPageNumber: number;
  totalNumberDevices: number;
  totalOnlineDevices: number;
  numPerPage: number;
  adminVersions: VersionInfo[];
  nodeVersions: VersionInfo[];
  clientFilter?: ClientFilter;
}

export class BrowserClient {
  numPerPage: number = 15;
  currentPage: number = 0;
  lastResult?: PaginationResult;
  currentFilter?: ClientFilter;

  /**
   * Generate pagination results based on current page number
   */
  async generatePaginationResult(): Promise<PaginationResult> {
    let devicePlugin = new DeviceRegistrationPlugin();

    let devices =
      (await devicePlugin.listWithFilter(
        this.currentPage,
        this.numPerPage,
        this.currentFilter
      )) ?? [];

    let onlineDevicesCount = await devicePlugin.getOnlineDevicesCount(
      this.currentFilter
    );
    let totalNumDevices = await devicePlugin.countWithFilter(
      this.currentFilter
    );
    const adminVersions = await devicePlugin.getListOfAdminVersions();
    const nodeVersions = await devicePlugin.getListOfNodeVersion();

    let paginationResult = {
      devices: devices,
      totalPageNumber: Math.floor(totalNumDevices / this.numPerPage),
      currentPageNumber: this.currentPage,
      totalNumberDevices: totalNumDevices,
      totalOnlineDevices: onlineDevicesCount,
      numPerPage: this.numPerPage,
      adminVersions,
      nodeVersions,
      clientFilter: this.currentFilter,
    };

    this.lastResult = paginationResult;
    return paginationResult;
  }
}
