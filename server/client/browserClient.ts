import {
  DeviceRegistrationPlugin,
  VersionInfo,
} from "../plugin/plugins/deviceRegistrationPlugin";
import { IDevice } from "../schema/device";
import { StorageManagementSystemPlugin } from "../plugin/plugins/storageManagementSystemPlugin";

export interface ClientFilter {
  key: string;
  value: any;
}

export interface PaginationResult {
  devices: IDevice[];
  /**
   * Total number of devices in the storage
   */
  totalStorageNumber: number;
  /**
   * Total page number
   */
  totalPageNumber: number;
  /**
   * Current page
   */
  currentPageNumber: number;
  /**
   * Total number of devices with filter
   */
  totalNumberDevices: number;
  /**
   * Total number of online devices with filter
   */
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
    let storageSystem = new StorageManagementSystemPlugin();

    if (!this.currentFilter) {
      return {
        adminVersions: [],
        clientFilter: undefined,
        currentPageNumber: 0,
        devices: [],
        nodeVersions: [],
        numPerPage: 0,
        totalNumberDevices: 0,
        totalOnlineDevices: 0,
        totalPageNumber: 0,
        totalStorageNumber: await storageSystem.count(),
      };
    }

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

    let paginationResult: PaginationResult = {
      totalStorageNumber: await storageSystem.count(),
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
